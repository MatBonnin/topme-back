import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { FacebookLoginDto } from './dto/facebook-login.dto';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user } = await this.authService.login(dto);
    // On envoie le refresh token dans un cookie HttpOnly
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 3600 * 1000, // 7 jours
    });
    return { access_token, user };
  }

  @Post('facebook')
  async facebookLogin(
    @Body() dto: FacebookLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user } =
      await this.authService.loginWithFacebook(dto);
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 3600 * 1000,
    });
    return { access_token, user };
  }

  /**  
   * Route pour rafraîchir l'access token  
   * Lit le cookie `refresh_token`, renvoie un nouveau access_token
   */
  @Get('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['refresh_token'];
    const { access_token, refresh_token } = await this.authService.refresh(token);
    // Rotation du refresh token
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 3600 * 1000,
    });
    return { access_token };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Supprime le cookie
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return { success: true };
  }
}
