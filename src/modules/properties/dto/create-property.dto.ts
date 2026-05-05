import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsEnum, IsNumber, IsOptional,
  IsUUID, IsArray, IsBoolean, IsDateString, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType } from '../enums/property-type.enum';
import { FurnishingStatus } from '../enums/furnishing-status.enum';
import { LeaseTerm } from '../enums/lease-term.enum';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Spacious 2BR Apartment in Kololo' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'A modern apartment with great views...' })
  @IsString()
  description: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({ example: 800000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  bedrooms?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  bathrooms?: number;

  @ApiProperty({ example: 'Kololo' })
  @IsString()
  area: string;

  @ApiPropertyOptional({ example: 'Plot 23, Acacia Avenue' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 0.3326 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ example: 32.5825 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({ enum: FurnishingStatus })
  @IsEnum(FurnishingStatus)
  @IsOptional()
  furnishing?: FurnishingStatus;

  @ApiPropertyOptional({ enum: LeaseTerm })
  @IsEnum(LeaseTerm)
  @IsOptional()
  leaseTerm?: LeaseTerm;

  @ApiPropertyOptional({ example: 500000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  securityDeposit?: number;

  @ApiPropertyOptional({ example: '2025-08-01' })
  @IsDateString()
  @IsOptional()
  availableFrom?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  floor?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  parkingAvailable?: boolean;

  @ApiProperty({ example: 'uuid-of-landlord' })
  @IsUUID()
  landlordId: string;

  @ApiProperty({ example: 'uuid-of-district' })
  @IsUUID()
  districtId: string;

  @ApiPropertyOptional({ example: ['Water', 'Electricity', 'WiFi'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];
}