import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// 7 days in seconds — mirrors the JWT expiresIn
const COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    /**
     * FIX: sameSite must be 'none' (not 'strict') when the frontend and backend
     * are on different domains (Vercel → Railway).
     *
     * 'strict' blocks the cookie from being sent on ANY cross-origin request,
     * which caused every API call to return 401 even when logged in.
     *
     * sameSite: 'none' requires secure: true — always set it regardless of env.
     *
     * path is changed from '/api' to '/' so the cookie is sent with every request,
     * not just those under /api (some clients strip the prefix).
     */
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,   // JS on the page can never read this token (blocks XSS)
      secure: true,     // Required when sameSite is 'none' — HTTPS only
      sameSite: 'none', // Allows cross-origin requests (Vercel → Railway)
      maxAge: COOKIE_MAX_AGE_SECONDS * 1_000, // ms
      path: '/',        // Sent with every request to this domain
    });

    // Return the user object (no token in the body — it lives in the cookie)
    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout — invalidates the current token',
    description:
      'Clears the httpOnly cookie and adds the token JTI to the blacklist so ' +
      'it cannot be reused even if it was copied before logout.',
  })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Pull the raw token — could arrive as a cookie OR a Bearer header
    const rawToken: string | undefined =
      (req.cookies as Record<string, string>)?.['access_token'] ??
      req.headers.authorization?.replace('Bearer ', '');

    if (rawToken) {
      try {
        const decoded = this.jwtService.decode(rawToken) as {
          jti?: string;
          exp?: number;
        } | null;

        if (decoded?.jti && decoded?.exp) {
          await this.authService.logout(decoded.jti, decoded.exp);
        }
      } catch {
        // Malformed token — nothing to blacklist, just clear the cookie
      }
    }

    // Always clear the cookie regardless of token validity
    // path must match exactly what was set during login
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }
}