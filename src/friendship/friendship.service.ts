import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship, FriendshipStatus } from './friendship.entity';
import { User } from '../users/user.entity';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship) private repo: Repository<Friendship>,
  ) {}

  async sendRequest(requester: User, addressee: User) {
    if (requester.id === addressee.id) throw new BadRequestException('Impossible de s\'ajouter soi-même.');
    const existing = await this.repo.findOne({ where: [
      { requester, addressee },
      { requester: addressee, addressee: requester }
    ] });
    if (existing) throw new BadRequestException('Déjà amis ou demande en cours.');
    const friendship = this.repo.create({ requester, addressee, status: FriendshipStatus.PENDING });
    return this.repo.save(friendship);
  }

  async acceptRequest(friendshipId: string, user: User) {
    const friendship = await this.repo.findOne({ where: { id: friendshipId }, relations: ['addressee'] });
    if (!friendship || friendship.addressee.id !== user.id) throw new NotFoundException('Demande non trouvée.');
    friendship.status = FriendshipStatus.ACCEPTED;
    return this.repo.save(friendship);
  }

  async rejectRequest(friendshipId: string, user: User) {
    const friendship = await this.repo.findOne({ where: { id: friendshipId }, relations: ['addressee'] });
    if (!friendship || friendship.addressee.id !== user.id) throw new NotFoundException('Demande non trouvée.');
    friendship.status = FriendshipStatus.REJECTED;
    return this.repo.save(friendship);
  }

  async removeFriend(user: User, friendId: string) {
    const friendship = await this.repo.findOne({
      where: [
        { requester: user, addressee: { id: friendId }, status: FriendshipStatus.ACCEPTED },
        { requester: { id: friendId }, addressee: user, status: FriendshipStatus.ACCEPTED }
      ],
      relations: ['requester', 'addressee']
    });
    if (!friendship) throw new NotFoundException('Amitié non trouvée.');
    await this.repo.remove(friendship);
    return { deleted: true };
  }

  async getFriends(user: User) {
    const friendships = await this.repo.find({
      where: [
        { requester: user, status: FriendshipStatus.ACCEPTED },
        { addressee: user, status: FriendshipStatus.ACCEPTED }
      ],
      relations: ['requester', 'addressee']
    });
    return friendships.map(f => f.requester.id === user.id ? f.addressee : f.requester);
  }

  async getPendingRequests(user: User) {
    return this.repo.find({ where: { addressee: user, status: FriendshipStatus.PENDING }, relations: ['requester'] });
  }

  async getSentRequests(user: User) {
    return this.repo.find({ where: { requester: user, status: FriendshipStatus.PENDING }, relations: ['addressee'] });
  }
}
