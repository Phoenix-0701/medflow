import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Role, User } from '@prisma/client';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateNotesDto } from './dto/update-notes.dto';
import { ReviewAppointmentDto } from './dto/review-appointment.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // API dành cho BỆNH NHÂN: Đặt lịch khám
  @Post('book')
  async book(
    @CurrentUser() user: User,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    if (user.role !== Role.PATIENT) {
      throw new ForbiddenException('Chỉ bệnh nhân mới có quyền đặt lịch.');
    }

    // Lưu ý: Lấy ID của patientProfile, không phải ID của user gốc
    const patientProfile = await this.appointmentsService[
      'prisma'
    ].patientProfile.findUnique({
      where: { userId: user.id },
    });

    return this.appointmentsService.bookAppointment(
      patientProfile.id,
      createAppointmentDto,
    );
  }

  // API dành cho BÁC SĨ: Xem danh sách lịch hẹn trong ngày
  @Get('my-schedule')
  async getMySchedule(@CurrentUser() user: User) {
    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException(
        'Chỉ bác sĩ mới có quyền truy cập lịch trình này.',
      );
    }

    const doctorProfile = await this.appointmentsService[
      'prisma'
    ].doctorProfile.findUnique({
      where: { userId: user.id },
    });

    return this.appointmentsService.getDoctorAppointments(doctorProfile.id);
  }
  // --- API DÀNH CHO BỆNH NHÂN ---
  @Get('me')
  async getMyAppointments(@CurrentUser() user: User) {
    if (user.role !== Role.PATIENT) {
      throw new ForbiddenException(
        'Chỉ bệnh nhân mới có quyền xem danh sách lịch hẹn của mình.',
      );
    }

    const patientProfile = await this.appointmentsService[
      'prisma'
    ].patientProfile.findUnique({
      where: { userId: user.id },
    });

    return this.appointmentsService.getPatientAppointments(patientProfile.id);
  }

  // --- API DÀNH CHO BÁC SĨ ---
  @Patch(':id/status')
  async updateStatus(
    @Param('id') appointmentId: string,
    @Body() dto: UpdateAppointmentStatusDto,
    @CurrentUser() user: User,
  ) {
    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException(
        'Chỉ bác sĩ mới có quyền cập nhật trạng thái ca khám.',
      );
    }

    const doctorProfile = await this.appointmentsService[
      'prisma'
    ].doctorProfile.findUnique({
      where: { userId: user.id },
    });

    return this.appointmentsService.updateAppointmentStatus(
      doctorProfile.id,
      appointmentId,
      dto.status,
    );
  }
  @Patch(':id/cancel')
  async cancelAppointment(
    @Param('id') appointmentId: string,
    @CurrentUser() user: User,
  ) {
    // Chặn luồng nếu người gọi không phải là bệnh nhân
    if (user.role !== Role.PATIENT) {
      throw new ForbiddenException('Chỉ bệnh nhân mới có quyền tự hủy lịch.');
    }

    const patientProfile = await this.appointmentsService[
      'prisma'
    ].patientProfile.findUnique({
      where: { userId: user.id },
    });

    if (!patientProfile) {
      throw new BadRequestException('Không tìm thấy hồ sơ bệnh nhân.');
    }

    return this.appointmentsService.cancelAppointment(
      patientProfile.id,
      appointmentId,
    );
  }

  @Patch(':id/review')
  async reviewAppointment(
    @Param('id') appointmentId: string,
    @Body() dto: ReviewAppointmentDto,
    @CurrentUser() user: User,
  ) {
    if (user.role !== Role.PATIENT) {
      throw new ForbiddenException('Chỉ bệnh nhân mới có quyền đánh giá.');
    }

    const patientProfile = await this.appointmentsService[
      'prisma'
    ].patientProfile.findUnique({
      where: { userId: user.id },
    });

    if (!patientProfile) {
      throw new BadRequestException('Không tìm thấy hồ sơ bệnh nhân.');
    }

    return this.appointmentsService.reviewAppointment(
      patientProfile.id,
      appointmentId,
      dto.rating,
      dto.reviewText,
    );
  }

  // --- API GHI BỆNH ÁN (DÀNH CHO BÁC SĨ) ---
  @Patch(':id/notes')
  async updateNotes(
    @Param('id') appointmentId: string,
    @Body() dto: UpdateNotesDto,
    @CurrentUser() user: User,
  ) {
    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException(
        'Chỉ bác sĩ mới có quyền ghi hồ sơ bệnh án.',
      );
    }

    const doctorProfile = await this.appointmentsService[
      'prisma'
    ].doctorProfile.findUnique({
      where: { userId: user.id },
    });

    return this.appointmentsService.updateAppointmentNotes(
      doctorProfile.id,
      appointmentId,
      dto,
    );
  }

  // --- API QUẢN LÝ BỆNH NHÂN (DÀNH CHO BÁC SĨ) ---
  @Get('doctor-patients')
  async getDoctorPatients(@CurrentUser() user: User) {
    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException(
        'Chỉ bác sĩ mới có quyền xem danh sách bệnh nhân.',
      );
    }

    const doctorProfile = await this.appointmentsService[
      'prisma'
    ].doctorProfile.findUnique({
      where: { userId: user.id },
    });

    return this.appointmentsService.getDoctorPatients(doctorProfile.id);
  }

  // --- API XEM LỊCH KHÁM (DÀNH CHO BÁC SĨ) ---
  @Get('doctor-schedule')
  async getDoctorSchedule(
    @CurrentUser() user: User,
    @Query('date') date?: string, // Query params nhận từ thanh URL
    @Query('status') status?: AppointmentStatus,
  ) {
    // Rào chắn phân quyền: Chỉ bác sĩ mới được vào
    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException(
        'Chỉ bác sĩ mới có quyền truy cập danh sách lịch khám này.',
      );
    }

    // Tra cứu Profile Bác sĩ từ user.id
    const doctorProfile = await this.appointmentsService[
      'prisma'
    ].doctorProfile.findUnique({
      where: { userId: user.id },
    });

    if (!doctorProfile) {
      throw new NotFoundException('Không tìm thấy hồ sơ bác sĩ hợp lệ.');
    }

    // Gọi Service
    return this.appointmentsService.getDoctorSchedule(
      doctorProfile.id,
      date,
      status,
    );
  }

  // --- API XEM CHI TIẾT CA KHÁM (Dùng chung cho 3 Role) ---
  @Get(':id')
  async getAppointmentDetails(
    @Param('id') appointmentId: string,
    @CurrentUser() user: User, // Bắt đối tượng User từ JWT Token
  ) {
    // Controller chỉ làm nhiệm vụ điều hướng, logic bảo mật đã giao cho Service
    return this.appointmentsService.getAppointmentById(appointmentId, user);
  }
}
