import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class CreateLandlordDto {
  @ApiProperty({ example: 'Joseph Kato' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: '+256701234567' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'joseph.kato@gmail.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+256701234567' })
  @IsString()
  @IsOptional()
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'CM9100001234567' })
  @IsString()
  @IsOptional()
  nationalId?: string;

  @ApiPropertyOptional({ example: 'Plot 45, Bukoto Street, Kampala' })
  @IsString()
  @IsOptional()
  physicalAddress?: string;

  @ApiPropertyOptional({ example: 'Prefers contact after 5pm' })
  @IsString()
  @IsOptional()
  notes?: string;
}