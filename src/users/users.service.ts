import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

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

    // Vérification de l'email avant la recherche
    if (profile.email) {
      user = await this.repo.findOne({ where: { email: profile.email } });
      if (user) {
        user.facebookId = profile.id;
        user.avatarUrl = profile.picture;
        return this.repo.save(user);
      }
    }

    // sinon, on crée un nouvel utilisateur
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

}
