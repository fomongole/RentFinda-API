import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ComplaintStatus } from '../enums/complaint-status.enum';

export class UpdateComplaintStatusDto {
  @ApiProperty({
    enum: ComplaintStatus,
    description: 'New status for the complaint',
  })
  @IsEnum(ComplaintStatus)
  status: ComplaintStatus;

  @ApiPropertyOptional({
    example: 'Contacted the property owner. Issue being addressed.',
  })
  @IsString()
  @IsOptional()
  adminNotes?: string;
}