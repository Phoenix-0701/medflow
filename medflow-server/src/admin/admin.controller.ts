import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard) // Bật bảo vệ 2 lớp (Phải có Token + Phải qua kiểm tra Role)
@Roles(Role.ADMIN) // Khóa API này lại, CHỈ ADMIN được vào
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('doctors')
  createDoctor(
    @Body('email') email: string,
    @Body('fullName') fullName: string,
    @Body('phone') phone: string,
    @Body('specialty') specialty: string,
    @Body('department') department: string,
    @Body('password') password?: string,
    @Body('licenseNumber') licenseNumber?: string,
    @Body('avatarUrl') avatarUrl?: string,
    @Body('yearsOfExperience') yearsOfExperience?: number,
  ) {
    return this.adminService.createDoctorAccount(
      email,
      fullName,
      phone,
      specialty,
      department,
      password,
      licenseNumber,
      avatarUrl,
      yearsOfExperience,
    );
  }

  @Post('patients')
  createPatient(
    @Body('email') email: string,
    @Body('fullName') fullName: string,
    @Body('phone') phone: string,
    @Body('password') password?: string,
    @Body('dateOfBirth') dateOfBirth?: string,
    @Body('gender') gender?: string,
  ) {
    return this.adminService.createPatientAccount(
      email,
      fullName,
      phone,
      password,
      dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
    );
  }

  // API 1: Lấy danh sách người dùng
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('doctors/:id')
  getDoctorDetails(@Param('id') id: string) {
    return this.adminService.getDoctorDetails(id);
  }

  @Patch('doctors/:id')
  updateDoctorProfile(
    @Param('id') id: string,
    @Body() data: { fullName?: string; phone?: string; specialty?: string; department?: string; isActive?: boolean; bio?: string; yearsOfExperience?: number; licenseNumber?: string; avatarUrl?: string }
  ) {
    return this.adminService.updateDoctorProfile(id, data);
  }

  // API 2: Đảo trạng thái Khóa/Mở khóa tài khoản
  @Patch('users/:id/toggle-lock')
  toggleUserLock(@Param('id') userId: string) {
    return this.adminService.toggleUserLock(userId);
  }

  // API 3: Thống kê Dashboard
  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
}
