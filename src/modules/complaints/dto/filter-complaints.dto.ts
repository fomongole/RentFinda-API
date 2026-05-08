import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ComplaintStatus } from '../enums/complaint-status.enum';
import { ComplaintCategory } from '../enums/complaint-category.enum';

export class FilterComplaintsDto {
  @ApiPropertyOptional({ enum: ComplaintStatus })
  @IsEnum(ComplaintStatus)
  @IsOptional()
  status?: ComplaintStatus;

  @ApiPropertyOptional({ enum: ComplaintCategory })
  @IsEnum(ComplaintCategory)
  @IsOptional()
  category?: ComplaintCategory;

  @ApiPropertyOptional({ description: 'Filter complaints for a specific property' })
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