import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ComplaintCategory } from '../enums/complaint-category.enum';

export class CreateComplaintDto {
  @ApiProperty({ example: 'Sarah Nakato' })
  @IsString()
  @MinLength(2)
  submitterName: string;

  @ApiProperty({ example: '+256701234567' })
  @IsString()
  submitterPhone: string;

  @ApiPropertyOptional({ example: 'sarah.nakato@gmail.com' })
  @IsEmail()
  @IsOptional()
  submitterEmail?: string;

  @ApiProperty({
    enum: ComplaintCategory,
    description: 'Category that best describes the complaint',
  })
  @IsEnum(ComplaintCategory)
  category: ComplaintCategory;

  @ApiProperty({
    example:
      'The landlord is demanding extra money beyond what was agreed. The property also has a broken water pipe that has been ignored for weeks.',
  })
  @IsString()
  @MinLength(10)
  description: string;

  /**
   * The property this complaint relates to.
   * Optional — some complaints (e.g. app bugs) are not property-specific.
   */
  @ApiPropertyOptional({ example: 'uuid-of-property' })
  @IsUUID()
  @IsOptional()
  propertyId?: string;
}