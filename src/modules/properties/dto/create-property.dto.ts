import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsEnum, IsNumber, IsOptional,
  IsUUID, IsArray, IsBoolean, IsDateString, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType } from '../enums/property-type.enum';
import { FurnishingStatus } from '../enums/furnishing-status.enum';
import { BillingCycle } from '../enums/billing-cycle.enum';
import { ResidentialSubtype } from '../enums/residential-subtype.enum';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Spacious Double House in Ntinda' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'A well-maintained double house with a garden...' })
  @IsString()
  description: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  type: PropertyType;

  /**
   * Required when type = RESIDENTIAL_HOUSE.
   * SINGLE = one bedroom, DOUBLE = two bedrooms.
   */
  @ApiPropertyOptional({ enum: ResidentialSubtype })
  @IsEnum(ResidentialSubtype)
  @IsOptional()
  residentialSubtype?: ResidentialSubtype;

  @ApiProperty({ example: 800000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  /**
   * The period this price applies to.
   * Required for all types except HOSTEL (billing cycle is set per room).
   * Allowed values depend on property type — enforced server-side.
   */
  @ApiPropertyOptional({ enum: BillingCycle })
  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle;

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

  @ApiProperty({ example: 'Ntinda' })
  @IsString()
  area: string;

  @ApiPropertyOptional({ example: 'Plot 23, Ntinda Road' })
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

  /**
   * The contact (owner or agent) managing this property.
   * Previously called landlordId.
   */
  @ApiProperty({ example: 'uuid-of-contact' })
  @IsUUID()
  contactId: string;

  @ApiProperty({ example: 'uuid-of-district' })
  @IsUUID()
  districtId: string;

  @ApiPropertyOptional({ example: ['Water', 'Electricity', 'WiFi', 'Security'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];
}