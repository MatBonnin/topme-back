// src/auth/auth.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { FacebookLoginDto } from './dto/facebook-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    // si ConflictException est levée, Nest renvoie 409
    return this.authService.register(dto);
  }

   @Post('facebook')
  facebookLogin(@Body() dto: FacebookLoginDto) {
    return this.authService.loginWithFacebook(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
