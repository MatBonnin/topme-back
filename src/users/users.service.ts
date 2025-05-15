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
}
