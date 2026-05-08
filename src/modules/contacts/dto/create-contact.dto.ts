import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, IsOptional, MinLength } from 'class-validator';
import { ContactRole } from '../enums/contact-role.enum';

export class CreateContactDto {
  @ApiProperty({ example: 'Joseph Kato' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: '+256701234567' })
  @IsString()
  phone: string;

  @ApiProperty({
    enum: ContactRole,
    description: 'OWNER = property owner | AGENT = broker or property manager',
  })
  @IsEnum(ContactRole)
  role: ContactRole;

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