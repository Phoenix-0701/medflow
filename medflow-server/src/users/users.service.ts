import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy toàn bộ thông tin User kèm Profile (dựa theo Role)
  async getProfile(userId: string, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: role === Role.PATIENT,
        doctorProfile: role === Role.DOCTOR,
      },
    });

    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  // Cập nhật thông tin phân nhánh theo Role
  async updateProfile(userId: string, role: Role, data: UpdateProfileDto) {
    // 1. Tách dữ liệu chung (bảng User)
    const { fullName, phone, avatarUrl, ...profileData } = data;

    // Cập nhật bảng User cơ sở
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(avatarUrl && { avatarUrl }),
      },
    });

    // 2. Nhánh cập nhật cho BỆNH NHÂN
    if (role === Role.PATIENT) {
      await this.prisma.patientProfile.upsert({
        where: { userId: userId },
        create: {
          userId: userId,
          dateOfBirth: profileData.dateOfBirth
            ? new Date(profileData.dateOfBirth)
            : null,
          gender: profileData.gender,
          bloodType: profileData.bloodType,
          allergies: profileData.allergies,
          medicalHistory: profileData.medicalHistory,
        },
        update: {
          ...(profileData.dateOfBirth && {
            dateOfBirth: new Date(profileData.dateOfBirth),
          }),
          ...(profileData.gender && { gender: profileData.gender }),
          ...(profileData.bloodType && { bloodType: profileData.bloodType }),
          ...(profileData.allergies && { allergies: profileData.allergies }),
          ...(profileData.medicalHistory && {
            medicalHistory: profileData.medicalHistory,
          }),
        },
      });
    }

    // 3. Nhánh cập nhật cho BÁC SĨ
    if (role === Role.DOCTOR) {
      await this.prisma.doctorProfile.upsert({
        where: { userId: userId },
        create: {
          userId: userId,
          specialty: profileData.specialty || 'Chưa cập nhật',
          department: profileData.department || 'Chưa cập nhật',
        },
        update: {
          ...(profileData.specialty && { specialty: profileData.specialty }),
          ...(profileData.department && { department: profileData.department }),
        },
      });
    }

    // Trả về dữ liệu mới nhất
    return this.getProfile(userId, role);
  }

  // --- HỖ TRỢ UPLOAD ẢNH QUA AWS S3 ---
  async getPresignedUrl(userId: string, fileName: string, fileType: string) {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || (!process.env.AWS_S3_BUCKET_NAME && !process.env.AWS_BUCKET_NAME)) {
      throw new InternalServerErrorException('Cấu hình AWS S3 chưa hoàn tất trên máy chủ.');
    }

    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-southeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME;
    // Đảm bảo tên file an toàn
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-]/g, '_');
    const key = `avatars/${userId}-${Date.now()}-${safeFileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
    });

    // Tạo URL có thời hạn 5 phút (300 giây)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return {
      uploadUrl,
      objectUrl: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  }

  // Hàm lấy danh sách bác sĩ cho Landing Page
  // async getPublicDoctors(limit: number = 4) {
  //   return this.prisma.user.findMany({
  //     where: {
  //       role: Role.DOCTOR,
  //     },
  //     select: {
  //       id: true,
  //       fullName: true,
  //       doctorProfile: {
  //         select: {
  //           specialty: true,
  //           department: true,
  //         },
  //       },
  //     },
  //     take: limit, // Lấy 4 bác sĩ nổi bật nhất
  //   });
  // }
  // // 1. PUBLIC API: Lấy danh sách tất cả bác sĩ
  // async getPublicDoctors(limit?: number) {
  //   return this.prisma.user.findMany({
  //     where: {
  //       role: Role.DOCTOR,
  //     },
  //     select: {
  //       id: true,
  //       fullName: true,
  //       doctorProfile: {
  //         select: {
  //           specialty: true,
  //           department: true,
  //         },
  //       },
  //     },
  //     // Nếu có truyền limit, sẽ giới hạn số lượng trả về (VD: lấy 4 bác sĩ cho trang chủ)
  //     take: limit ? Number(limit) : undefined,
  //   });
  // }

  async getPublicDoctors(limit: number = 4) {
    return this.prisma.doctorProfile.findMany({
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  // 2. PUBLIC API: Lấy chi tiết 1 bác sĩ
  async getPublicDoctorById(doctorId: string) {
    const doctor = await this.prisma.user.findFirst({
      where: {
        id: doctorId,
        role: Role.DOCTOR,
      },
      select: {
        id: true,
        fullName: true,
        doctorProfile: {
          select: {
            specialty: true,
            department: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Không tìm thấy thông tin bác sĩ này.');
    }

    return doctor;
  }

  // --- API DÀNH CHO BÁC SĨ ---
  // Lấy chi tiết bệnh nhân kèm theo TOÀN BỘ lịch sử khám (của tất cả bác sĩ)
  async getPatientDetails(patientId: string) {
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true },
        },
        appointments: {
          orderBy: { startTime: 'desc' },
          include: {
            doctor: {
              include: { user: { select: { fullName: true } } }
            },
            medicalRecord: true,
            triageSession: true,
          }
        }
      }
    });

    if (!patient) throw new NotFoundException('Không tìm thấy hồ sơ bệnh nhân');
    return patient;
  }

  // Cập nhật các chỉ số sinh tồn cơ bản của bệnh nhân
  async updatePatientStats(patientId: string, data: { weight?: number; height?: number; bloodType?: string }) {
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: patientId }
    });

    if (!patient) throw new NotFoundException('Không tìm thấy hồ sơ bệnh nhân');

    return this.prisma.patientProfile.update({
      where: { id: patientId },
      data: {
        weight: data.weight,
        height: data.height,
        bloodType: data.bloodType,
      }
    });
  }

  // --- API DÀNH CHO LANDING PAGE / PUBLIC ---
  async getPublicReviews(limit: number = 3) {
    return this.prisma.appointment.findMany({
      where: {
        rating: 5,
        reviewText: { not: null },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        patient: {
          include: {
            user: {
              select: {
                fullName: true,
              }
            }
          }
        }
      }
    });
  }

  async getTopDoctors() {
    const doctors = await this.prisma.doctorProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          }
        },
        appointments: {
          where: { rating: { not: null } },
          select: { rating: true }
        }
      }
    });

    return doctors.map(doc => {
      const totalReviews = doc.appointments.length;
      const averageRating = totalReviews > 0 
        ? doc.appointments.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalReviews 
        : 0;

      // Xóa mảng appointments khỏi response để nhẹ payload
      const { appointments, ...rest } = doc;
      return {
        ...rest,
        totalReviews,
        averageRating: Number(averageRating.toFixed(1))
      };
    }).sort((a, b) => b.averageRating - a.averageRating);
  }
}
