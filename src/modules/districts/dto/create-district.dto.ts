import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional } from 'class-validator';
 
export class CreateDistrictDto {
  @ApiProperty({ example: 'Nakaseke' })
  @IsString()
  @MinLength(2)
  name: string;
 
  @ApiPropertyOptional({ example: 'Central' })
  @IsString()
  @IsOptional()
  region?: string;
}