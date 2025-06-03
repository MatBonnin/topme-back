import { Controller, Post, Body, Param, Delete, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FriendshipService } from './friendship.service';
import { UsersService } from '../users/users.service';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('friendship')
export class FriendshipController {
  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly usersService: UsersService,
  ) {}

  @Post('request/:userId')
  async sendRequest(@Req() req: RequestWithUser, @Param('userId') userId: string) {
    const addressee = await this.usersService.findById(userId);
    if (!addressee) {
      throw new Error('Utilisateur destinataire introuvable');
    }
    return this.friendshipService.sendRequest(req.user, addressee);
  }

  @Post('accept/:friendshipId')
  async acceptRequest(@Req() req: RequestWithUser, @Param('friendshipId') friendshipId: string) {
    return this.friendshipService.acceptRequest(friendshipId, req.user);
  }

  @Post('reject/:friendshipId')
  async rejectRequest(@Req() req: RequestWithUser, @Param('friendshipId') friendshipId: string) {
    return this.friendshipService.rejectRequest(friendshipId, req.user);
  }

  @Delete(':friendId')
  async removeFriend(@Req() req: RequestWithUser, @Param('friendId') friendId: string) {
    return this.friendshipService.removeFriend(req.user, friendId);
  }

  @Get('friends')
  async getFriends(@Req() req: RequestWithUser) {
    return this.friendshipService.getFriends(req.user);
  }

  @Get('pending')
  async getPendingRequests(@Req() req: RequestWithUser) {
    return this.friendshipService.getPendingRequests(req.user);
  }

  @Get('sent')
  async getSentRequests(@Req() req: RequestWithUser) {
    return this.friendshipService.getSentRequests(req.user);
  }
}
