import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class SetFeaturedDto {
  @ApiProperty({
    description:
      'Set to true to feature this property, false to remove it from featured listings.',
  })
  @IsBoolean()
  isFeatured: boolean;

  @ApiPropertyOptional({
    example: '2025-06-30',
    description:
      'The date until which this listing stays featured. ' +
      'Required when isFeatured is true. Automatically cleared when isFeatured is false.',
  })
  @IsDateString()
  @IsOptional()
  featuredUntil?: string;
}