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

  /**
   * Optional NyumbaLink user account ID.
   *
   * If the renter is logged in to the mobile app, the app should include
   * their userId here so that admin status updates (IN_PROGRESS, RESOLVED, CLOSED)
   * are delivered as in-app notifications to their account.
   */
  @ApiPropertyOptional({
    example: 'uuid-of-renter-user',
    description:
      'UUID of the logged-in renter\'s user account. ' +
      'Pass when authenticated so status-update notifications are delivered in-app.',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;
}