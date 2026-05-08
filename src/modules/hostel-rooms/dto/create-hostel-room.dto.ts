import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray, IsEnum, IsNumber, IsOptional, IsString, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HostelRoomType } from '../enums/hostel-room-type.enum';
import { BillingCycle } from '../../properties/enums/billing-cycle.enum';

/** Billing cycles allowed at hostel room level */
export const HOSTEL_ROOM_BILLING_CYCLES = [
  BillingCycle.MONTHLY,
  BillingCycle.FOUR_MONTHS,
  BillingCycle.BIANNUAL,
  BillingCycle.ANNUAL,
] as const;

export class CreateHostelRoomDto {
  @ApiProperty({ example: '101', description: 'Room number/label — unique within the hostel' })
  @IsString()
  roomNumber: string;

  @ApiProperty({ enum: HostelRoomType })
  @IsEnum(HostelRoomType)
  type: HostelRoomType;

  @ApiProperty({ example: 350000, description: 'Price in UGX for the selected billing cycle' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({
    enum: BillingCycle,
    description: `Billing period for this room. Allowed: ${HOSTEL_ROOM_BILLING_CYCLES.join(' | ')}. DAILY is not allowed for hostels.`,
  })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  floor?: number;

  @ApiPropertyOptional({ example: 'En-suite, faces the garden' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: ['En-suite bathroom', 'Study desk', 'Wardrobe'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];
}