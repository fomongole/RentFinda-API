import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ContactRole } from '../enums/contact-role.enum';

export class FilterContactsDto {
  @ApiPropertyOptional({ description: 'Search by name or phone' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: ContactRole, description: 'Filter by role: OWNER or AGENT' })
  @IsEnum(ContactRole)
  @IsOptional()
  role?: ContactRole;

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