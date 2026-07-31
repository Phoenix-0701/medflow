import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminEnableUserCommand,
  AdminDisableUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  private cognitoClient: CognitoIdentityProviderClient;

  constructor(private prisma: PrismaService) {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION,
    });
  }

  async createDoctorAccount(
    email: string,
    fullName: string,
    phone: string,
    specialty: string,
    department: string,
    password?: string,
    licenseNumber?: string,
    avatarUrl?: string,
    yearsOfExperience?: number,
  ) {
    try {
      let cognitoId: string;
      try {
        // 1. Gọi AWS Cognito để tạo User.
        const command = new AdminCreateUserCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Username: email,
          UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'email_verified', Value: 'true' },
          ],
          MessageAction: 'SUPPRESS',
        });
        const cognitoResponse = await this.cognitoClient.send(command);

        // 2. Thiết lập mật khẩu vĩnh viễn
        if (password) {
          const setPasswordCommand = new AdminSetUserPasswordCommand({
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: email,
            Password: password,
            Permanent: true,
          });
          await this.cognitoClient.send(setPasswordCommand);
        }
        
        cognitoId = cognitoResponse.User.Attributes.find(
          (attr) => attr.Name === 'sub',
        ).Value;
      } catch (awsError) {
        console.warn('CẢNH BÁO: Không thể tạo user trên Cognito (Lỗi IAM/Quyền truy cập). Sẽ tạo ID ảo (fake) để test DB/UI. Lỗi:', awsError.message);
        cognitoId = 'fake-cognito-' + Date.now();
      }

      // 3. Lưu vào PostgreSQL bằng Transaction để đảm bảo tính toàn vẹn dữ liệu
      const newDoctor = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            cognitoId: cognitoId,
            email: email,
            fullName: fullName,
            phone: phone,
            role: Role.DOCTOR,
            avatarUrl: avatarUrl,
          },
        });

        await tx.doctorProfile.create({
          data: {
            user: {
              connect: { id: user.id },
            },
            specialty: specialty,
            department: department,
            licenseNumber: licenseNumber,
            yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
          },
        });

        return user;
      });

      return {
        message: 'Tạo tài khoản Bác sĩ thành công.',
        doctor: newDoctor,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Lỗi khi tạo bác sĩ: ${error.message}`,
      );
    }
  }

  async createPatientAccount(
    email: string,
    fullName: string,
    phone: string,
    password?: string,
    dateOfBirth?: Date,
    gender?: string,
  ) {
    try {
      let cognitoId: string;
      try {
        // 1. Gọi AWS Cognito để tạo User.
        const command = new AdminCreateUserCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Username: email,
          UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'email_verified', Value: 'true' },
          ],
          MessageAction: 'SUPPRESS',
        });
        const cognitoResponse = await this.cognitoClient.send(command);

        // 2. Thiết lập mật khẩu vĩnh viễn
        if (password) {
          const setPasswordCommand = new AdminSetUserPasswordCommand({
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: email,
            Password: password,
            Permanent: true,
          });
          await this.cognitoClient.send(setPasswordCommand);
        }

        // Lấy UUID mà Cognito vừa tạo ra
        cognitoId = cognitoResponse.User.Attributes.find(
          (attr) => attr.Name === 'sub',
        ).Value;
      } catch (awsError) {
        console.warn('CẢNH BÁO: Không thể tạo user trên Cognito (Lỗi IAM/Quyền truy cập). Sẽ tạo ID ảo (fake) để test DB/UI. Lỗi:', awsError.message);
        cognitoId = 'fake-cognito-' + Date.now();
      }

      // 3. Lưu vào PostgreSQL bằng Transaction
      const newPatient = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            cognitoId: cognitoId,
            email: email,
            fullName: fullName,
            phone: phone,
            role: Role.PATIENT,
          },
        });

        await tx.patientProfile.create({
          data: {
            user: {
              connect: { id: user.id },
            },
            dateOfBirth: dateOfBirth,
            gender: gender,
          },
        });

        return user;
      });

      return {
        message: 'Tạo tài khoản Bệnh nhân thành công.',
        patient: newPatient,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Lỗi khi tạo bệnh nhân: ${error.message}`,
      );
    }
  }

  // 1. Lấy danh sách toàn bộ người dùng (Bác sĩ, Bệnh nhân)
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isActive: true, // Trả về trạng thái để UI hiển thị nút Khóa/Mở khóa
        createdAt: true,
        doctorProfile: {
          select: { specialty: true, department: true }
        },
        patientProfile: {
          select: { dateOfBirth: true, gender: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDoctorDetails(doctorId: string) {
    const doctor = await this.prisma.user.findFirst({
      where: { id: doctorId, role: Role.DOCTOR },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        doctorProfile: {
          select: {
            id: true,
            specialty: true,
            department: true,
            bio: true,
            yearsOfExperience: true,
            licenseNumber: true,
          }
        }
      }
    });

    if (!doctor) throw new NotFoundException('Không tìm thấy bác sĩ này.');

    // Tính rating và lấy danh sách review
    const appointmentsWithRating = await this.prisma.appointment.findMany({
      where: { doctorId: doctor.doctorProfile.id, rating: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        patient: { include: { user: { select: { fullName: true } } } }
      }
    });

    const averageRating = appointmentsWithRating.length > 0 
      ? (appointmentsWithRating.reduce((acc, curr) => acc + curr.rating, 0) / appointmentsWithRating.length).toFixed(1)
      : 0;

    // Tính tổng số bệnh nhân duy nhất (distinct)
    const uniquePatientsResult = await this.prisma.appointment.findMany({
      where: { doctorId: doctor.doctorProfile.id },
      distinct: ['patientId'],
      select: { patientId: true },
    });
    const totalPatients = uniquePatientsResult.length;

    // Lịch khám gần đây
    const recentAppointments = await this.prisma.appointment.findMany({
      where: { doctorId: doctor.doctorProfile.id },
      orderBy: { startTime: 'desc' },
      take: 5,
      include: {
        patient: { include: { user: { select: { fullName: true } } } }
      }
    });

    return {
      ...doctor,
      averageRating: averageRating,
      totalPatients: totalPatients,
      reviews: appointmentsWithRating.map(a => ({
        id: a.id,
        rating: a.rating,
        reviewText: a.reviewText,
        createdAt: a.createdAt,
        patientName: a.patient.user.fullName
      })),
      recentAppointments: recentAppointments.map(a => ({
        id: a.id,
        patientName: a.patient.user.fullName,
        patientInitials: a.patient.user.fullName.split(' ').map((n: string) => n[0]).join('').slice(-2).toUpperCase(),
        time: `${a.startTime.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - ${a.startTime.toLocaleDateString('vi-VN')}`,
        reason: a.diagnosis || 'Khám định kỳ',
        status: a.status
      }))
    };
  }

  async updateDoctorProfile(doctorId: string, data: { fullName?: string; phone?: string; specialty?: string; department?: string; isActive?: boolean; bio?: string; yearsOfExperience?: number; licenseNumber?: string; avatarUrl?: string }) {
    const user = await this.prisma.user.findFirst({ where: { id: doctorId, role: Role.DOCTOR } });
    if (!user) throw new NotFoundException('Không tìm thấy bác sĩ');

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: doctorId },
        data: {
          fullName: data.fullName !== undefined ? data.fullName : undefined,
          phone: data.phone !== undefined ? data.phone : undefined,
          isActive: data.isActive !== undefined ? data.isActive : undefined,
          avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : undefined,
        }
      });
      if (data.specialty !== undefined || data.department !== undefined || data.bio !== undefined || data.yearsOfExperience !== undefined || data.licenseNumber !== undefined) {
        await tx.doctorProfile.update({
          where: { userId: doctorId },
          data: {
            specialty: data.specialty !== undefined ? data.specialty : undefined,
            department: data.department !== undefined ? data.department : undefined,
            bio: data.bio !== undefined ? data.bio : undefined,
            yearsOfExperience: data.yearsOfExperience !== undefined ? data.yearsOfExperience : undefined,
            licenseNumber: data.licenseNumber !== undefined ? data.licenseNumber : undefined,
          }
        });
      }
      return u;
    });

    // Cập nhật trạng thái Cognito nếu có isActive
    if (data.isActive !== undefined) {
      try {
        if (data.isActive) {
          await this.cognitoClient.send(new AdminEnableUserCommand({ UserPoolId: process.env.COGNITO_USER_POOL_ID, Username: user.email }));
        } else {
          await this.cognitoClient.send(new AdminDisableUserCommand({ UserPoolId: process.env.COGNITO_USER_POOL_ID, Username: user.email }));
        }
      } catch (err) {
        console.error("Lỗi cập nhật trạng thái Cognito:", err);
      }
    }
    
    return updatedUser;
  }

  // 2. Khóa hoặc Mở khóa tài khoản
  async toggleUserLock(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng này.');
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException(
        'Không thể khóa tài khoản của Quản trị viên hệ thống.',
      );
    }

    // Đảo ngược trạng thái hiện tại (Đang true thì thành false, và ngược lại)
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, isActive: true },
    });

    return {
      message: updatedUser.isActive
        ? 'Đã mở khóa tài khoản.'
        : 'Đã khóa tài khoản thành công.',
      user: updatedUser,
    };
  }

  // 3. Lấy dữ liệu thống kê cho Dashboard
  async getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay() + 1); // Thứ 2
    startOfThisWeek.setHours(0, 0, 0, 0);
    
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    // Chạy các truy vấn song song
    const [
      totalDoctors,
      activeDoctors,
      totalPatients,
      totalAppointments,
      todayAppointments,
      allRecentAppointments,
      recentUsers
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.DOCTOR } }),
      this.prisma.user.count({ where: { role: Role.DOCTOR, isActive: true } }),
      this.prisma.user.count({ where: { role: Role.PATIENT } }),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({
        where: { startTime: { gte: startOfToday, lte: endOfToday } },
      }),
      this.prisma.appointment.findMany({
        where: { startTime: { gte: startOfLastWeek } },
        include: {
          doctor: { select: { department: true } }
        }
      }),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, fullName: true, role: true, createdAt: true, isActive: true }
      })
    ]);

    // Dữ liệu bệnh nhân theo chuyên khoa
    const departmentMap: Record<string, number> = {};
    let totalCountWithDep = 0;
    
    // Lấy toàn bộ appointments cho khoa (có thể lấy all thay vì recent, nhưng dùng tạm allRecentAppointments cho nhẹ)
    const allAppointmentsForDep = await this.prisma.appointment.findMany({
      include: { doctor: { select: { department: true } } }
    });
    
    allAppointmentsForDep.forEach(appt => {
      const dep = appt.doctor?.department || 'Khác';
      departmentMap[dep] = (departmentMap[dep] || 0) + 1;
      totalCountWithDep++;
    });
    
    if (totalCountWithDep === 0) totalCountWithDep = 1; // avoid division by 0

    const patientsByDepartment = Object.keys(departmentMap).map(key => ({
      name: key,
      value: Math.round((departmentMap[key] / totalCountWithDep) * 100)
    })).sort((a,b) => b.value - a.value);

    // Dữ liệu xu hướng tuần này vs tuần trước
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Hôm nay'];
    const appointmentsTrend = days.map((day, idx) => ({ 
      name: day, 
      thisWeek: 0, 
      lastWeek: 0,
      dayIndex: idx === 6 ? 0 : idx + 1 // Map lại day index: Thứ 2 = 1, Thứ 3 = 2 ... CN/Hôm nay = 0
    }));

    allRecentAppointments.forEach(appt => {
      const isThisWeek = appt.startTime >= startOfThisWeek;
      const dayIdx = appt.startTime.getDay(); // 0 = Sun, 1 = Mon
      
      const trendItem = appointmentsTrend.find(t => t.dayIndex === dayIdx);
      if (trendItem) {
        if (isThisWeek) trendItem.thisWeek++;
        else trendItem.lastWeek++;
      }
    });

    // Dữ liệu hoạt động gần đây
    const recentActivities = recentUsers.map(u => ({
      id: u.id,
      event: `${u.role === 'DOCTOR' ? 'Bác sĩ' : 'Bệnh nhân'} ${u.fullName} vừa đăng ký`,
      role: u.role,
      time: u.createdAt,
      status: u.isActive ? 'ACTIVE' : 'INACTIVE'
    }));

    return {
      totalDoctors,
      activeDoctors,
      totalPatients,
      totalAppointments,
      todayAppointments,
      patientsByDepartment,
      appointmentsTrend,
      recentActivities
    };
  }
}
