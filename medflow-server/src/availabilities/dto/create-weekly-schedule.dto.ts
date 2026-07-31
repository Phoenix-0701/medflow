import { IsOptional, IsArray } from 'class-validator';

export class CreateWeeklyScheduleDto {
  @IsOptional()
  @IsArray()
  monday?: any;

  @IsOptional()
  @IsArray()
  tuesday?: any;

  @IsOptional()
  @IsArray()
  wednesday?: any;

  @IsOptional()
  @IsArray()
  thursday?: any;

  @IsOptional()
  @IsArray()
  friday?: any;

  @IsOptional()
  @IsArray()
  saturday?: any;

  @IsOptional()
  @IsArray()
  sunday?: any;
}
