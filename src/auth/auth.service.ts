// src/auth/auth.service.ts

import * as bcrypt from 'bcrypt';

import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';

import { FacebookLoginDto } from './dto/facebook-login.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { QueryFailedError } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    try {
      return await this.usersService.create(dto.email, dto.username, dto.password);
    } catch (err: any) {
      // TypeORM lance une QueryFailedError pour la contrainte unique
      if (err instanceof QueryFailedError && err.driverError.code === '23505') {
        // détail du err.driverError.detail = 'La clé « (email)=(...) » existe déjà.'
        throw new ConflictException('Email déjà utilisé');
      }
      // sinon on remonte
      throw err;
    }
  }

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Identifiants invalides');
    const valid = await bcrypt.compare(pass, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    const payload = { sub: user.id, email: user.email };
    return { access_token: this.jwtService.sign(payload), user };
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

  async loginWithFacebook(dto: FacebookLoginDto) {
    const profile = await this.fetchFacebookProfile(dto.accessToken);
    const user = await this.usersService.findOrCreateFromFacebook(profile);
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
