import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Register a new renter account' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login as admin or renter' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);

    // Return token in response body.
    // Frontend stores it in a js-cookie and sends it as a Bearer header.
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout — invalidates the current token' })
  // auth.controller.ts — logout method
async logout(@Req() req: Request, @CurrentUser() user: User) {
  const rawToken = req.headers.authorization?.replace('Bearer ', '');

  if (rawToken) {
    try {
      const decoded = this.jwtService.decode(rawToken) as {
        jti?: string; exp?: number;
      } | null;

      if (decoded?.jti && decoded?.exp) {
        await this.authService.logout(decoded.jti, decoded.exp, user); // ← pass user
      }
    } catch {
      // Malformed token
    }
  }

  return { message: 'Logged out successfully' };
}

  @Post('forgot-password')
  @Throttle({ default: { ttl: 60_000, limit: 3 } })   // strict — OTPs are a DDoS surface
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password-reset OTP — rate limited to 3/min' })
  @ApiResponse({ status: 200, description: 'Always returns 200 to prevent email enumeration' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and set a new password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'OTP invalid or expired' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}