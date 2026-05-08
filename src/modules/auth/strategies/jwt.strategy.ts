import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') as string,
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    try {
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException('Session expired. Please log in again.');
      if (!user.isActive) throw new UnauthorizedException('Account is deactivated.');
      return user;
    } catch {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }
  }
}