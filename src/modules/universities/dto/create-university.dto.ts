import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateUniversityDto {
  @ApiProperty({ example: 'Makerere University' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'MUK', description: 'Common abbreviation shown in the UI' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  shortName?: string;

  @ApiPropertyOptional({ example: 'Wandegeya, Kampala' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  location?: string;
}