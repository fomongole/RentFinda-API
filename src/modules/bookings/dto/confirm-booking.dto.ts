import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConfirmBookingDto {
  @ApiPropertyOptional({ example: 'Tenant verified. Key collection on move-in day.' })
  @IsString()
  @IsOptional()
  adminNotes?: string;
}