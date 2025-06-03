import * as bcrypt from 'bcrypt';

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { FacebookLoginDto } from './dto/facebook-login.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { QueryFailedError } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { AuthPayload } from './interfaces/auth-payload.interface';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly refreshSecret: string;
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    // On récupère d’abord potentiellement undefined
    const secret = this.config.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('🚨 JWT_REFRESH_SECRET manquant dans .env');
    }
    // Puis on l’assigne à la propriété typée string
    this.refreshSecret = secret;
    

  }

  async register(dto: RegisterDto): Promise<User> {
    try {
      return await this.usersService.create(
        dto.email,
        dto.username,
        dto.password,
      );
    } catch (err: any) {
      if (
        err instanceof QueryFailedError &&
        err.driverError.code === '23505'
      ) {
        throw new ConflictException('Email déjà utilisé');
      }
      throw err;
    }
  }

  private async fetchFacebookProfile(
    accessToken: string,
  ): Promise<{ id: string; email: string; name: string; picture: string }> {
    const res = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`,
    );
    if (!res.ok) {
      throw new UnauthorizedException('Token Facebook invalide');
    }
    const data = await res.json();
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture.data.url,
    };
  }

  /** Génère pair access+refresh tokens */
  private generateTokens(user: User): AuthPayload {
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: '7d',
    });
    return { access_token, refresh_token, user };
  }

  async login(dto: LoginDto): Promise<AuthPayload> {
    const user = await this.validateUser(dto.email, dto.password);
    return this.generateTokens(user);
  }

  async loginWithFacebook(dto: FacebookLoginDto): Promise<AuthPayload> {
    const profile = await this.fetchFacebookProfile(dto.accessToken);
    const user = await this.usersService.findOrCreateFromFacebook(profile);
    return this.generateTokens(user);
  }

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user)
      throw new UnauthorizedException('Identifiants invalides');
    const valid = await bcrypt.compare(pass, user.passwordHash);
    if (!valid)
      throw new UnauthorizedException('Identifiants invalides');
    return user;
  }

  /**
   * Rafraîchit l'access_token à partir du refresh_token.
   * Vérifie sa validité, lève UnauthorizedException sinon.
   */
  async refresh(token: string): Promise<AuthPayload> {
    if (!token) {
      throw new UnauthorizedException('Refresh token manquant');
    }
    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalide');
    }
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }
    return this.generateTokens(user);
  }
}
