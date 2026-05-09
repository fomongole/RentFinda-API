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
  renterPhone: string;

  @ApiPropertyOptional({ example: 'sarah@gmail.com' })
  @IsEmail()
  @IsOptional()
  renterEmail?: string;

  @ApiProperty({ example: 'uuid-of-property' })
  @IsUUID()
  propertyId: string;

  @ApiPropertyOptional({
    example: 'uuid-of-hostel-room',
    description: 'Required when booking a HOSTEL property — identifies the specific room.',
  })
  @IsUUID()
  @IsOptional()
  hostelRoomId?: string;

  @ApiProperty({ example: '2026-06-01', description: 'ISO date string (YYYY-MM-DD)' })
  @IsDateString()
  moveInDate: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'ISO date string (YYYY-MM-DD). Omit for open-ended agreements.' })
  @IsDateString()
  @IsOptional()
  moveOutDate?: string;

  @ApiPropertyOptional({ example: 'I need a pet-friendly unit.' })
  @IsString()
  @IsOptional()
  notes?: string;

  /**
   * Optional NyumbaLink user account ID.
   *
   * If the renter is logged in to the mobile app when submitting a booking,
   * the app should include their userId here. This enables the platform to send
   * in-app notifications (confirmed, cancelled, completed) to their account.
   *
   * Omit for anonymous bookings — the cancellationToken serves as proof of
   * ownership in that case.
   */
  @ApiPropertyOptional({
    example: 'uuid-of-renter-user',
    description:
      'UUID of the logged-in renter\'s user account. ' +
      'Pass this when the user is authenticated in the mobile app so lifecycle ' +
      'notifications are delivered to their notification inbox.',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;
}