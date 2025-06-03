import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService, SearchUsersResult } from './users.service';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req: RequestWithUser) {
    const { passwordHash, ...user } = req.user;
    return user;
  }

  /**
   * GET /users/search?q=xxx&page=1&limit=20
   */
  @Get('search')
  async searchUsers(
    @Req() req: RequestWithUser,
    @Query('q') q: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<SearchUsersResult> {
    if (!q || q.trim().length < 1) {
      return { users: [], total: 0 };
    }
    return this.usersService.searchUsers(q.trim(), req.user.id, page, limit);
  }
}
