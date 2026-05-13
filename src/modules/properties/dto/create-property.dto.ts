import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsEnum, IsNumber, IsOptional,
  IsUUID, IsArray, IsBoolean, IsDateString,
  Min, IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType }       from '../enums/property-type.enum';
import { FurnishingStatus }   from '../enums/furnishing-status.enum';
import { BillingCycle }       from '../enums/billing-cycle.enum';
import { HotelCategory }      from '../enums/hotel-category.enum';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Spacious 3-Room Apartment in Kololo' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'A well-maintained apartment with modern finishes...' })
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

  /**
   * The period this price applies to.
   * Required for all types except HOSTEL (billing cycle is set per room).
   */
  @ApiPropertyOptional({ enum: BillingCycle })
  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle;

  /**
   * Total number of rooms in the property.
   * Not applicable to HOSTEL (stripped server-side).
   */
  @ApiPropertyOptional({
    example: 3,
    description: 'Number of rooms in this property. Not used for HOSTEL type.',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  numberOfRooms?: number;

  /**
   * HOSTEL only — maximum number of HostelRoom entries allowed under this property.
   */
  @ApiPropertyOptional({
    example: 20,
    description:
      'HOSTEL only: maximum number of rooms that can be added to this hostel. ' +
      'Leave empty for no cap.',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  totalRooms?: number;

  /**
   * HOTEL_LODGE only — service-tier category.
   */
  @ApiPropertyOptional({
    enum: HotelCategory,
    description: 'HOTEL_LODGE only: property category (ORDINARY | VIP | VVIP).',
  })
  @IsEnum(HotelCategory)
  @IsOptional()
  hotelCategory?: HotelCategory;

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

  @ApiPropertyOptional({ example: 3, description: 'Floor / level number (0 = ground floor)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  floor?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  parkingAvailable?: boolean;

  /**
   * The contact (owner or agent) managing this property.
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

  // ── HOSTEL-only fields ────────────────────────────────────────────────────

  /**
   * HOSTEL only: the nearby university this hostel primarily serves.
   * Stripped server-side for all other property types.
   */
  @ApiPropertyOptional({
    example: 'uuid-of-university',
    description:
      'HOSTEL only: links this hostel to a nearby university so renters can ' +
      'search "hostels near Kyambogo".',
  })
  @IsUUID()
  @IsOptional()
  universityId?: string;

  /**
   * HOSTEL only: walking / commuting distance to the linked university in kilometres.
   * Admin-entered — more accurate than a straight-line calculation.
   * Stripped server-side for all other property types.
   */
  @ApiPropertyOptional({
    example: 0.5,
    description:
      'HOSTEL only: approximate distance to the linked university in kilometres ' +
      '(e.g. 0.5 = 500 m). Admin-entered to reflect actual walking distance.',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  approximateDistanceKm?: number;
}