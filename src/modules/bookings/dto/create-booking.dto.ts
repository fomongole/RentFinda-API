import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'Sarah Nakato' })
  @IsString()
  @MinLength(2)
  renterName: string;

  @ApiProperty({ example: '+256701234567' })
  @IsString()
  @MinLength(10)
  renterPhone: string;

  @ApiPropertyOptional({ example: 'sarah.nakato@gmail.com' })
  @IsEmail()
  @IsOptional()
  renterEmail?: string;

  @ApiProperty({ example: 'uuid-of-property' })
  @IsUUID()
  propertyId: string;

  /**
   * Only required for hostel bookings.
   * When provided, this booking is for a specific hostel room.
   */
  @ApiPropertyOptional({ example: 'uuid-of-hostel-room' })
  @IsUUID()
  @IsOptional()
  hostelRoomId?: string;

  @ApiProperty({ example: '2025-09-01' })
  @IsDateString()
  moveInDate: string;

  @ApiPropertyOptional({ example: '2026-08-31' })
  @IsDateString()
  @IsOptional()
  moveOutDate?: string;

  @ApiPropertyOptional({
    example: 'I am a final year student at Makerere. Can I view the room first?',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}