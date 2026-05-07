import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Length, IsOptional } from 'class-validator';

export class CancelByRenterDto {
  @ApiProperty({ example: '482916', description: '6-digit cancellation token from booking confirmation' })
  @IsString()
  @Length(6, 6)
  cancellationToken: string;

  @ApiPropertyOptional({ example: 'Found another place.' })
  @IsString()
  @IsOptional()
  reason?: string;
}