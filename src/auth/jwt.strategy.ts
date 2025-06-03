import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private cfg: ConfigService,
    private usersService: UsersService,
  ) {
    const jwtSecret = cfg.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('🚨 JWT_SECRET n’est pas défini dans .env');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,  
    });
  }

  async validate(payload: JwtPayload) {
    return this.usersService.findById(payload.sub);
  }
}
