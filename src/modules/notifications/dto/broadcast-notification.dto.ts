import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class BroadcastNotificationDto {
  @ApiProperty({
    example: 'Scheduled Maintenance Tonight',
    description: 'Short notification title shown in the app notification list',
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    example:
      'The NyumbaLink platform will be under maintenance from 11 PM to 1 AM EAT. ' +
      'Booking submissions may be temporarily unavailable.',
    description: 'Full notification message body',
  })
  @IsString()
  @MinLength(10)
  message: string;

  @ApiPropertyOptional({
    example: { url: '/announcements/123' },
    description:
      'Optional JSON metadata the mobile app can use for deep-linking or additional context',
  })
  @IsObject()
  @IsOptional()
  data?: Record<string, unknown>;
}