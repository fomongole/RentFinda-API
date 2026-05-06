import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelBookingDto {
  @ApiPropertyOptional({ example: 'Property already taken by another renter.' })
  @IsString()
  @IsOptional()
  reason?: string;
}