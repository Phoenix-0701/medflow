import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AvailabilitiesService } from './availabilities.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, Role } from '@prisma/client';

@Controller('availabilities')
export class AvailabilitiesController {
  constructor(private readonly availabilitiesService: AvailabilitiesService) {}

  // --- API DÀNH CHO BÁC SĨ (Private) ---
  @UseGuards(JwtAuthGuard)
  @Post('create-schedule')
  async createSchedule(
    @CurrentUser() user: User,
    @Body() dto: CreateScheduleDto,
  ) {
    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException('Chỉ bác sĩ mới có quyền mở lịch khám.');
    }

    const doctorProfile = await this.availabilitiesService[
      'prisma'
    ].doctorProfile.findUnique({
      where: { userId: user.id },
    });

    if (!doctorProfile) {
      throw new ForbiddenException('Không tìm thấy hồ sơ bác sĩ.');
    }

    return this.availabilitiesService.createSchedule(doctorProfile.id, dto);
  }

  // --- API DÀNH CHO CLIENT / BỆNH NHÂN (Public) ---
  @Get('doctors/:doctorId')
  async getDoctorSlots(
    @Param('doctorId') doctorId: string,
    @Query('date') date?: string, // Query Param tùy chọn (VD: ?date=2026-07-25)
  ) {
    return this.availabilitiesService.getAvailableSlotsByDoctor(doctorId, date);
  }

  // --- API XÓA LỊCH (DÀNH CHO BÁC SĨ) ---
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteSchedule(
    @CurrentUser() user: User,
    @Param('id') availabilityId: string,
  ) {
    // Chặn luồng nếu người gọi không phải là bác sĩ
    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException(
        'Chỉ bác sĩ mới có quyền xóa lịch làm việc.',
      );
    }

    // Trích xuất ID của Profile Bác sĩ
    const doctorProfile = await this.availabilitiesService[
      'prisma'
    ].doctorProfile.findUnique({
      where: { userId: user.id },
    });

    if (!doctorProfile) {
      throw new ForbiddenException('Không tìm thấy hồ sơ bác sĩ.');
    }

    return this.availabilitiesService.deleteSlot(
      doctorProfile.id,
      availabilityId,
    );
  }

  // --- API LỊCH LÀM VIỆC CỐ ĐỊNH ---
  @UseGuards(JwtAuthGuard)
  @Get('weekly-schedule')
  async getWeeklySchedule(@CurrentUser() user: User) {
    if (user.role !== Role.DOCTOR) throw new ForbiddenException();
    
    const doctorProfile = await this.availabilitiesService['prisma'].doctorProfile.findUnique({
      where: { userId: user.id },
    });
    if (!doctorProfile) throw new ForbiddenException('Không tìm thấy hồ sơ bác sĩ.');
    
    return this.availabilitiesService.getWeeklySchedule(doctorProfile.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('weekly-schedule')
  async upsertWeeklySchedule(
    @CurrentUser() user: User,
    @Body() dto: any, // Using any for simplicity here
  ) {
    if (user.role !== Role.DOCTOR) throw new ForbiddenException();
    
    const doctorProfile = await this.availabilitiesService['prisma'].doctorProfile.findUnique({
      where: { userId: user.id },
    });
    if (!doctorProfile) throw new ForbiddenException('Không tìm thấy hồ sơ bác sĩ.');
    
    return this.availabilitiesService.upsertWeeklySchedule(doctorProfile.id, dto);
  }

  // --- API LỊCH ĐÃ KHÓA (NGÀY NGHỈ) ---
  @UseGuards(JwtAuthGuard)
  @Get('leaves')
  async getLeaves(@CurrentUser() user: User) {
    if (user.role !== Role.DOCTOR) throw new ForbiddenException();
    
    const doctorProfile = await this.availabilitiesService['prisma'].doctorProfile.findUnique({
      where: { userId: user.id },
    });
    if (!doctorProfile) throw new ForbiddenException('Không tìm thấy hồ sơ bác sĩ.');
    
    return this.availabilitiesService.getLeaves(doctorProfile.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('leaves')
  async createLeave(
    @CurrentUser() user: User,
    @Body() dto: any,
  ) {
    if (user.role !== Role.DOCTOR) throw new ForbiddenException();
    
    const doctorProfile = await this.availabilitiesService['prisma'].doctorProfile.findUnique({
      where: { userId: user.id },
    });
    if (!doctorProfile) throw new ForbiddenException('Không tìm thấy hồ sơ bác sĩ.');
    
    return this.availabilitiesService.createLeave(doctorProfile.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('leaves/:id')
  async deleteLeave(
    @CurrentUser() user: User,
    @Param('id') leaveId: string,
  ) {
    if (user.role !== Role.DOCTOR) throw new ForbiddenException();
    
    const doctorProfile = await this.availabilitiesService['prisma'].doctorProfile.findUnique({
      where: { userId: user.id },
    });
    if (!doctorProfile) throw new ForbiddenException('Không tìm thấy hồ sơ bác sĩ.');
    
    return this.availabilitiesService.deleteLeave(doctorProfile.id, leaveId);
  }
}
