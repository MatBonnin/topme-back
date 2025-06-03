import { Injectable } from '@nestjs/common';
import { Repository, ILike, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

export interface SearchUsersResult {
  users: User[];
  total: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
  ) {}

  async create(email: string, username: string, pass: string): Promise<User> {
    const hash = await bcrypt.hash(pass, 10);
    const user = this.repo.create({ email, username, passwordHash: hash });
    return this.repo.save(user);
  }

  async findByEmail(email: string): Promise<User|null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User|null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByFacebookId(facebookId: string): Promise<User | null> {
    return this.repo.findOne({ where: { facebookId } });
  }

  async findOrCreateFromFacebook(profile: {
    id: string;
    email: string;
    name: string;
    picture: string;
  }): Promise<User> {
    let user = await this.findByFacebookId(profile.id);
    if (user) return user;

    if (profile.email) {
      user = await this.repo.findOne({ where: { email: profile.email } });
      if (user) {
        user.facebookId = profile.id;
        user.avatarUrl = profile.picture;
        return this.repo.save(user);
      }
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(randomPassword, 10);
    const newUser = this.repo.create({
      facebookId: profile.id,
      email: profile.email,
      username: profile.name,
      passwordHash: hash,
      avatarUrl: profile.picture,
    });
    return this.repo.save(newUser);
  }

  /**
   * Recherche des utilisateurs par username ou email.
   * Exclut l'utilisateur courant (excludeUserId) et retourne total + liste paginée.
   */
  async searchUsers(
    query: string,
    excludeUserId: string,
    page = 1,
    limit = 20,
  ): Promise<SearchUsersResult> {
    const qb: SelectQueryBuilder<User> = this.repo.createQueryBuilder('user');

    qb.where('(user.username ILIKE :q OR user.email ILIKE :q)', { q: `%${query}%` })
      .andWhere('user.id <> :self', { self: excludeUserId })
      .orderBy('user.username', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await qb.getManyAndCount();
    return { users, total };
  }
}
