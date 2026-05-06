import { IsEnum, IsOptional, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '../enums/booking-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterBookingsDto {
  @ApiPropertyOptional({ enum: BookingStatus })
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}