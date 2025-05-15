import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';


@Controller('users')
export class UsersController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    // req.user est injecté par JwtStrategy
    const { passwordHash, ...user } = req.user;
    return user;
  }
}
