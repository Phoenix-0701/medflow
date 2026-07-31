import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentStatus } from '@prisma/client';
import { UpdateNotesDto } from './dto/update-notes.dto';
import { User, Role } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async bookAppointment(patientId: string, dto: CreateAppointmentDto) {
    try {
      // Sử dụng Interactive Transaction của Prisma
      // Mọi thao tác trong này sẽ thành công toàn bộ (Commit) hoặc thất bại toàn bộ (Rollback)
      return await this.prisma.$transaction(async (tx) => {
        // 1. ATOMIC UPDATE: Kỹ thuật chống Race Condition cốt lõi
        // Chúng ta cố gắng cập nhật slot thành "isBooked = true",
        // NHƯNG điều kiện bắt buộc là slot đó phải đang ở trạng thái "isBooked = false".
        const lockedSlot = await tx.doctorAvailability.updateMany({
          where: {
            id: dto.availabilityId,
            doctorId: dto.doctorId,
            isBooked: false,
          },
          data: {
            isBooked: true,
          },
        });

        // Nhánh Điều Kiện 1 (MCDC Path 1): Cập nhật thất bại
        // Nghĩa là slot không tồn tại HOẶC vừa bị một bệnh nhân khác nẫng tay trên trong 1/1000 giây trước.
        if (lockedSlot.count === 0) {
          throw new ConflictException(
            'Khung giờ này đã được đặt hoặc không tồn tại. Vui lòng chọn giờ khác!',
          );
        }

        // Nhánh Điều Kiện 2 (MCDC Path 2): Cập nhật thành công (Slot đã thuộc về bệnh nhân này)
        // 2. Lấy thông tin thời gian của slot để ghi vào lịch hẹn
        const slotDetails = await tx.doctorAvailability.findUnique({
          where: { id: dto.availabilityId },
        });

        // 3. Tạo bản ghi lịch hẹn (Appointment)
        const newAppointment = await tx.appointment.create({
          data: {
            patientId: patientId,
            doctorId: dto.doctorId,
            startTime: slotDetails.startTime,
            endTime: slotDetails.endTime,
            status: AppointmentStatus.CONFIRMED,
            triageSessionId: dto.triageSessionId,
          },
        });

        return newAppointment;
      });
    } catch (error) {
      // Đảm bảo không nuốt mất lỗi ConflictException do chúng ta ném ra
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Lỗi hệ thống khi đặt lịch. Vui lòng thử lại.',
      );
    }
  }

  // Hàm tiện ích: Bác sĩ xem danh sách các ca khám của mình
  async getDoctorAppointments(doctorId: string) {
    return this.prisma.appointment.findMany({
      where: { doctorId },
      include: {
        patient: {
          include: { user: { select: { fullName: true, phone: true } } },
        },
        triageSession: true, // Đính kèm báo cáo AI để bác sĩ đọc trước
      },
      orderBy: { startTime: 'asc' },
    });
  }

  // 1. NGHIỆP VỤ BÁC SĨ: Cập nhật trạng thái lịch hẹn
  async updateAppointmentStatus(
    doctorId: string,
    appointmentId: string,
    status: AppointmentStatus,
  ) {
    // Tìm lịch hẹn để kiểm tra xem nó có tồn tại không
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Không tìm thấy ca khám này.');
    }

    // Bảo mật: Kiểm tra xem ca khám này có đúng là của bác sĩ đang đăng nhập không
    // (Test case quan trọng: Bác sĩ A truyền ID lịch của Bác sĩ B -> Phải văng lỗi)
    if (appointment.doctorId !== doctorId) {
      throw new ForbiddenException(
        'Bạn không có quyền thay đổi trạng thái ca khám của bác sĩ khác.',
      );
    }

    // Tiến hành cập nhật
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: status },
    });
  }

  // 2. NGHIỆP VỤ BỆNH NHÂN: Xem lịch sử / lịch sắp tới
  async getPatientAppointments(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId: patientId },
      include: {
        // Kéo theo thông tin bác sĩ để hiển thị lên UI cho đẹp
        doctor: {
          include: {
            user: { select: { fullName: true, phone: true } },
          },
        },
        triageSession: true, // Nếu bệnh nhân muốn xem lại kết quả AI chẩn đoán
        medicalRecord: true, // Lấy bệnh án để bệnh nhân xem chi tiết chẩn đoán và đơn thuốc
      },
      orderBy: {
        startTime: 'desc', // Ca khám mới nhất (hoặc sắp tới) sẽ nổi lên đầu
      },
    });
  }
  // 3. NGHIỆP VỤ BỆNH NHÂN: Hủy lịch khám
  async cancelAppointment(patientId: string, appointmentId: string) {
    // 1. Kiểm tra tính hợp lệ của lịch hẹn
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Không tìm thấy lịch hẹn này.');
    }

    // Nhánh bảo mật: Chặn bệnh nhân A hủy lịch của bệnh nhân B
    if (appointment.patientId !== patientId) {
      throw new ForbiddenException(
        'Bạn không có quyền hủy lịch hẹn của người khác.',
      );
    }

    // Nhánh logic: Không thể hủy một lịch đã bị hủy từ trước
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Lịch hẹn này đã được hủy trước đó.');
    }

    // Nhánh logic: Không thể hủy lịch khi đã khám xong
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Không thể hủy lịch hẹn đã hoàn tất.');
    }

    // 2. Mở Transaction để Hủy lịch và Nhả slot cùng một lúc (Atomic)
    return await this.prisma.$transaction(async (tx) => {
      // Hành động 1: Cập nhật status của Appointment thành CANCELLED
      const cancelledAppointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.CANCELLED },
      });

      // Hành động 2: Nhả slot (DoctorAvailability)
      // Tìm chính xác slot dựa trên ID bác sĩ và khoảng thời gian của ca khám bị hủy
      await tx.doctorAvailability.updateMany({
        where: {
          doctorId: appointment.doctorId,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          isBooked: true, // Chỉ nhả các slot đang bị khóa
        },
        data: {
          isBooked: false, // Trả lại slot cho cộng đồng
        },
      });

      return {
        message:
          'Đã hủy lịch khám thành công. Khung giờ này đã được mở lại cho bệnh nhân khác.',
        appointment: cancelledAppointment,
      };
    });
  }

  // API MỚI: Bác sĩ cập nhật hồ sơ bệnh án sau khi khám
  async updateAppointmentNotes(
    doctorId: string,
    appointmentId: string,
    dto: UpdateNotesDto,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Không tìm thấy ca khám này.');
    }

    // Bảo mật 1: Chỉ bác sĩ phụ trách ca khám mới được viết bệnh án
    if (appointment.doctorId !== doctorId) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật bệnh án của bác sĩ khác.',
      );
    }

    // Bảo mật 2: Không thể cập nhật ca khám đã hủy
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException(
        'Không thể cập nhật bệnh án cho ca khám đã bị hủy.',
      );
    }

    // Sử dụng Transaction để vừa chốt ca khám vừa tạo MedicalRecord
    return await this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật Appointment (tự động chuyển sang COMPLETED)
      const updatedAppt = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: AppointmentStatus.COMPLETED,
          diagnosis: dto.diagnosis,
          prescription: dto.prescription,
        },
      });

      // 2. Upsert Medical Record (Cho phép bác sĩ cập nhật lại nếu gõ sai)
      const medicalRecord = await tx.medicalRecord.upsert({
        where: { appointmentId: appointmentId },
        create: {
          appointmentId: appointmentId,
          patientId: appointment.patientId,
          clinicalFindings: dto.clinicalFindings,
          finalDiagnosis: dto.diagnosis,
          prescription: dto.prescription,
        },
        update: {
          clinicalFindings: dto.clinicalFindings,
          finalDiagnosis: dto.diagnosis,
          prescription: dto.prescription,
        },
      });

      return { appointment: updatedAppt, medicalRecord };
    });
  }

  // API MỚI: Bác sĩ xem danh sách bệnh nhân của mình (có hỗ trợ filter)
  async getDoctorSchedule(
    doctorId: string,
    date?: string,
    status?: AppointmentStatus,
  ) {
    const whereClause: any = {
      doctorId: doctorId,
    };

    // 1. Nhánh điều kiện lọc theo ngày (vd: xem lịch khám hôm nay)
    if (date) {
      const filterDate = new Date(date);
      if (isNaN(filterDate.getTime())) {
        throw new BadRequestException(
          'Định dạng ngày không hợp lệ (YYYY-MM-DD).',
        );
      }

      const startOfDay = new Date(`${date}T00:00:00`);
      const endOfDay = new Date(`${date}T23:59:59`);

      whereClause.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // 2. Nhánh điều kiện lọc theo trạng thái (vd: chỉ lấy ca CONFIRMED)
    if (status) {
      whereClause.status = status;
    }

    // Thực thi truy vấn
    return this.prisma.appointment.findMany({
      where: whereClause,
      include: {
        // Trích xuất thông tin người bệnh để bác sĩ có thể gọi tên
        patient: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        // Có thể lấy kèm dữ liệu AI Triage nếu có để bác sĩ đọc trước khi khám
        triageSession: true,
        // Lấy kèm medicalRecord để hiển thị lại thông tin đã nhập nếu ca khám đã COMPLETED
        medicalRecord: true,
      },
      orderBy: {
        startTime: 'asc', // Luôn sắp xếp từ ca sáng đến ca chiều
      },
    });
  }

  // API MỚI: Xem chi tiết 1 ca khám (Áp dụng cho cả Admin, Bác sĩ và Bệnh nhân)
  async getAppointmentById(appointmentId: string, currentUser: User) {
    // 1. Truy vấn ca khám kèm theo các bảng liên quan (JOIN)
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        // Kéo thông tin Bác sĩ (và user tương ứng)
        doctor: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, phone: true },
            },
          },
        },
        // Kéo thông tin Bệnh nhân (và user tương ứng)
        patient: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, phone: true },
            },
          },
        },
        // Kéo lịch sử chat AI (nếu có)
        // triageSession: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Không tìm thấy thông tin ca khám này.');
    }

    // 2. Rào chắn bảo mật phân quyền ngang (Horizontal Authorization)
    // Người dùng được phép xem nếu thỏa mãn MỘT TRONG BA điều kiện sau:
    const isAdmin = currentUser.role === Role.ADMIN;
    const isAssignedDoctor = appointment.doctor.user.id === currentUser.id;
    const isOwnerPatient = appointment.patient.user.id === currentUser.id;

    if (!isAdmin && !isAssignedDoctor && !isOwnerPatient) {
      throw new ForbiddenException(
        'Lỗi bảo mật: Bạn không có quyền truy cập hồ sơ bệnh án của người khác.',
      );
    }

    // 3. Trả về dữ liệu nếu qua được chốt kiểm tra
    return appointment;
  }

  // API MỚI: Bác sĩ xem danh sách bệnh nhân
  async getDoctorPatients(doctorId: string) {
    const patients = await this.prisma.patientProfile.findMany({
      where: {
        appointments: {
          some: { doctorId: doctorId },
        },
      },
      include: {
        user: {
          select: { fullName: true, phone: true, email: true, avatarUrl: true },
        },
        appointments: {
          where: { doctorId: doctorId },
          orderBy: { startTime: 'desc' },
          take: 1, // Chỉ lấy ca khám gần nhất
          include: { triageSession: true },
        },
      },
    });

    // Format lại dữ liệu cho Frontend dễ dùng
    return patients.map((p) => ({
      id: p.id,
      userId: p.userId,
      user: p.user,
      gender: p.gender,
      dateOfBirth: p.dateOfBirth,
      latestAppointment: p.appointments[0] || null,
    }));
  }

  // API ĐÁNH GIÁ BÁC SĨ (DÀNH CHO BỆNH NHÂN)
  async reviewAppointment(patientId: string, appointmentId: string, rating: number, reviewText?: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Không tìm thấy ca khám này.');
    }

    if (appointment.patientId !== patientId) {
      throw new ForbiddenException('Bạn không có quyền đánh giá ca khám của người khác.');
    }

    if (appointment.status !== 'COMPLETED') {
      throw new BadRequestException('Chỉ có thể đánh giá những ca khám đã hoàn tất.');
    }

    if (appointment.rating) {
      throw new BadRequestException('Ca khám này đã được đánh giá rồi.');
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        rating,
        reviewText,
      },
    });
  }
}
