import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateProfileDto {
  // --- THÔNG TIN CHUNG ---
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  // --- THÔNG TIN DÀNH CHO BỆNH NHÂN ---
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  medicalHistory?: string;

  // --- THÔNG TIN DÀNH CHO BÁC SĨ ---
  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  department?: string;
}
