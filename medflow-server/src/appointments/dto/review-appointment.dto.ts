import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ReviewAppointmentDto {
  @IsInt()
  @Min(1, { message: 'Điểm đánh giá tối thiểu là 1 sao.' })
  @Max(5, { message: 'Điểm đánh giá tối đa là 5 sao.' })
  rating: number;

  @IsOptional()
  @IsString()
  reviewText?: string;
}
