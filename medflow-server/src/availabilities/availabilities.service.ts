import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class AvailabilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  private generateTimeSlots(
    dateStr: string,
    startStr: string,
    endStr: string,
    duration: number,
  ) {
    const slots = [];
    const startTime = new Date(`${dateStr}T${startStr}:00`);
    const endTime = new Date(`${dateStr}T${endStr}:00`);
    const now = new Date();

    // Nhánh 1: Validation cơ bản
    if (startTime >= endTime) {
      throw new BadRequestException('Giờ kết thúc phải lớn hơn giờ bắt đầu.');
    }

    let currentSlotStart = new Date(startTime);

    // Vòng lặp sinh khung giờ
    while (currentSlotStart < endTime) {
      const currentSlotEnd = new Date(
        currentSlotStart.getTime() + duration * 60000,
      );

      // Đảm bảo slot cuối cùng không vượt quá giờ kết thúc ca làm việc
      if (currentSlotEnd > endTime) break;

      // Chỉ thêm vào danh sách nếu slot bắt đầu trong tương lai
      if (currentSlotStart >= now) {
        slots.push({
          startTime: currentSlotStart,
          endTime: currentSlotEnd,
        });
      }

      currentSlotStart = currentSlotEnd; // Nhảy đến slot tiếp theo
    }

    return slots;
  }

  async createSchedule(doctorId: string, dto: CreateScheduleDto) {
    // 1. Chạy thuật toán sinh danh sách slots
    const requestedSlots = this.generateTimeSlots(
      dto.date,
      dto.startTime,
      dto.endTime,
      dto.slotDuration,
    );

    if (requestedSlots.length === 0) {
      throw new BadRequestException(
        'Khoảng thời gian quá ngắn để tạo ca khám.',
      );
    }

    const dayStart = requestedSlots[0].startTime;
    const dayEnd = requestedSlots[requestedSlots.length - 1].endTime;

    // 2. Overlap Check: Tìm xem trong ngày này, bác sĩ đã có slot nào chưa
    const existingSlots = await this.prisma.doctorAvailability.findMany({
      where: {
        doctorId: doctorId,
        startTime: {
          gte: new Date(`${dto.date}T00:00:00`),
          lt: new Date(`${dto.date}T23:59:59`),
        },
      },
    });

    // Nhánh 3: Kiểm tra xung đột thời gian (Collision Detection)
    // Duyệt qua các slot chuẩn bị tạo, xem có đè lên slot nào đã tồn tại trong DB không
    for (const newSlot of requestedSlots) {
      const isOverlap = existingSlots.some(
        (existing) =>
          (newSlot.startTime >= existing.startTime &&
            newSlot.startTime < existing.endTime) ||
          (newSlot.endTime > existing.startTime &&
            newSlot.endTime <= existing.endTime) ||
          (newSlot.startTime <= existing.startTime &&
            newSlot.endTime >= existing.endTime),
      );

      if (isOverlap) {
        throw new ConflictException(
          `Khung giờ xung đột: Bác sĩ đã có lịch trong khoảng thời gian này.`,
        );
      }
    }

    // 3. Insert hàng loạt vào Database (Bulk Insert)
    const slotsToInsert = requestedSlots.map((slot) => ({
      doctorId: doctorId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isBooked: false, // Mặc định vừa tạo ra là chưa ai đặt
    }));

    await this.prisma.doctorAvailability.createMany({
      data: slotsToInsert,
    });

    return {
      message: `Đã tạo thành công ${slotsToInsert.length} khung giờ khám mới.`,
      slots: slotsToInsert,
    };
  }

  async getAvailableSlotsByDoctor(doctorId: string, date?: string) {
    const now = new Date();

    // Mặc định: Luôn lọc các slot có thời gian lớn hơn hiện tại
    let startTimeFilter: any = { gt: now };

    // Nếu Client (Next.js) có truyền query 'date' lên (VD: 2026-07-25)
    if (date) {
      const filterDate = new Date(date);
      if (isNaN(filterDate.getTime())) {
        throw new BadRequestException(
          'Định dạng ngày không hợp lệ. Vui lòng dùng định dạng YYYY-MM-DD.',
        );
      }

      const startOfDay = new Date(`${date}T00:00:00`);
      const endOfDay = new Date(`${date}T23:59:59`);

      // Kỹ thuật gộp điều kiện:
      // Nếu ngày lọc là hôm nay, giờ bắt đầu phải lớn hơn giờ hiện tại (now).
      // Nếu ngày lọc là ngày mai/ngày kia, giờ bắt đầu tính từ 00:00:00 (startOfDay).
      startTimeFilter = {
        gt: startOfDay > now ? startOfDay : now,
        lt: endOfDay,
      };
    }

    // Truy vấn vào Database qua Prisma
    const availableSlots = await this.prisma.doctorAvailability.findMany({
      where: {
        doctorId: doctorId,
        isBooked: false, // Core logic: Chỉ lấy slot CÒN TRỐNG
        startTime: startTimeFilter,
      },
      orderBy: {
        startTime: 'asc', // Sắp xếp từ sáng đến chiều để FE dễ render
      },
    });

    return availableSlots;
  }

  // API MỚI: Bác sĩ xóa một khung giờ rảnh
  async deleteSlot(doctorId: string, availabilityId: string) {
    // 1. Kiểm tra sự tồn tại của khung giờ
    const slot = await this.prisma.doctorAvailability.findUnique({
      where: { id: availabilityId },
    });

    if (!slot) {
      throw new NotFoundException('Không tìm thấy khung giờ này.');
    }

    // 2. Bảo mật: Chặn bác sĩ A xóa nhầm/cố ý xóa khung giờ của bác sĩ B
    if (slot.doctorId !== doctorId) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác trên lịch của bác sĩ khác.',
      );
    }

    // 3. Logic cốt lõi: Tuyệt đối không xóa slot đã có bệnh nhân đặt
    if (slot.isBooked) {
      throw new BadRequestException(
        'Khung giờ này đã có bệnh nhân đặt lịch. Bạn cần phải hủy lịch khám đó (Appointment) trước khi xóa khung giờ.',
      );
    }

    // 4. Tiến hành xóa khỏi cơ sở dữ liệu
    await this.prisma.doctorAvailability.delete({
      where: { id: availabilityId },
    });

    return {
      message: 'Đã xóa khung giờ làm việc thành công.',
      deletedSlotId: availabilityId,
    };
  }

  // --- API LỊCH LÀM VIỆC CỐ ĐỊNH (WEEKLY SCHEDULE) ---
  async getWeeklySchedule(doctorId: string) {
    let schedule = await this.prisma.doctorWeeklySchedule.findUnique({
      where: { doctorId },
    });

    if (!schedule) {
      // Return default empty schedule if none exists
      return {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      };
    }
    return schedule;
  }

  async upsertWeeklySchedule(doctorId: string, dto: any) {
    const schedule = await this.prisma.doctorWeeklySchedule.upsert({
      where: { doctorId },
      update: {
        monday: dto.monday || [],
        tuesday: dto.tuesday || [],
        wednesday: dto.wednesday || [],
        thursday: dto.thursday || [],
        friday: dto.friday || [],
        saturday: dto.saturday || [],
        sunday: dto.sunday || [],
      },
      create: {
        doctorId,
        monday: dto.monday || [],
        tuesday: dto.tuesday || [],
        wednesday: dto.wednesday || [],
        thursday: dto.thursday || [],
        friday: dto.friday || [],
        saturday: dto.saturday || [],
        sunday: dto.sunday || [],
      },
    });

    // Tự động sinh slot cho 30 ngày tới
    const today = new Date();
    const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    // Lấy các slot hiện tại để check overlap
    const existingSlots = await this.prisma.doctorAvailability.findMany({
      where: {
        doctorId: doctorId,
        startTime: { gte: new Date(today.setHours(0,0,0,0)) },
      },
    });

    // Lấy các ngày nghỉ để tránh sinh slot đè lên ngày nghỉ
    const leaves = await this.prisma.doctorLeave.findMany({
      where: { doctorId, endDate: { gte: new Date() } }
    });

    const newSlotsToInsert = [];

    for (let i = 0; i < 30; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i);
      const dayName = daysMap[targetDate.getDay()];
      
      const daySlotsConfig = (schedule as any)[dayName] as any[];
      if (!daySlotsConfig || daySlotsConfig.length === 0) continue;

      // format YYYY-MM-DD
      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      for (const config of daySlotsConfig) {
        try {
          const generated = this.generateTimeSlots(dateStr, config.start, config.end, 30);
          
          for (const newSlot of generated) {
            // Check overlap với ngày nghỉ
            const inLeave = leaves.some((leave) => 
              newSlot.startTime >= leave.startDate && 
              newSlot.startTime <= new Date(leave.endDate.getTime() + 86400000)
            );
            if (inLeave) continue;

            // Check overlap với slot đã có
            const isOverlap = existingSlots.some(
              (existing) =>
                (newSlot.startTime >= existing.startTime && newSlot.startTime < existing.endTime) ||
                (newSlot.endTime > existing.startTime && newSlot.endTime <= existing.endTime) ||
                (newSlot.startTime <= existing.startTime && newSlot.endTime >= existing.endTime)
            );

            if (!isOverlap) {
              newSlotsToInsert.push({
                doctorId: doctorId,
                startTime: newSlot.startTime,
                endTime: newSlot.endTime,
                isBooked: false,
              });
            }
          }
        } catch(e) {
          // Bỏ qua lỗi (vd: giờ kết thúc < giờ bắt đầu, hoặc thời gian trong quá khứ)
        }
      }
    }

    if (newSlotsToInsert.length > 0) {
      await this.prisma.doctorAvailability.createMany({
        data: newSlotsToInsert,
      });
    }

    return {
      message: 'Đã cập nhật lịch làm việc cố định và tự động sinh ca khám cho 30 ngày tới.',
      schedule,
    };
  }

  // --- API NGÀY NGHỈ ĐỘT XUẤT (LEAVES) ---
  async getLeaves(doctorId: string) {
    return this.prisma.doctorLeave.findMany({
      where: { doctorId },
      orderBy: { startDate: 'desc' },
    });
  }

  async createLeave(doctorId: string, dto: any) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    
    // Đảm bảo startDate <= endDate
    if (startDate > endDate) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu.');
    }

    // 1. Tạo Leave
    const leave = await this.prisma.doctorLeave.create({
      data: {
        doctorId,
        startDate,
        endDate,
        reason: dto.reason,
      },
    });

    // 2. Logic xóa các slot chưa được đặt trong khoảng thời gian nghỉ
    // Mục tiêu: Không cho bệnh nhân thấy các khung giờ này
    await this.prisma.doctorAvailability.deleteMany({
      where: {
        doctorId,
        isBooked: false, // Chỉ xóa các slot CHƯA CÓ người đặt
        startTime: {
          gte: startDate,
        },
        endTime: {
          lte: new Date(endDate.getTime() + 24 * 60 * 60 * 1000), // đến hết ngày endDate
        },
      },
    });

    return {
      message: 'Đã thêm lịch nghỉ thành công. Hệ thống đã tự động gỡ các ca khám chưa được đặt trong thời gian này.',
      leave,
    };
  }

  async deleteLeave(doctorId: string, leaveId: string) {
    const leave = await this.prisma.doctorLeave.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new NotFoundException('Không tìm thấy lịch nghỉ này.');
    }

    if (leave.doctorId !== doctorId) {
      throw new ForbiddenException('Bạn không có quyền xóa lịch nghỉ của bác sĩ khác.');
    }

    await this.prisma.doctorLeave.delete({
      where: { id: leaveId },
    });

    return {
      message: 'Đã hủy ngày nghỉ thành công.',
      deletedLeaveId: leaveId,
    };
  }
}
