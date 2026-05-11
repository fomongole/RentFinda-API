import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';
import { IsStrongPassword } from '../../../common/decorators/is-strong-password.decorator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '482910', description: '6-digit OTP sent to the email' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;

  @IsStrongPassword('NewPassword456')
  newPassword: string;
}