import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from './list.entity';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { User } from '../users/user.entity';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List) private repo: Repository<List>,
  ) {}

  create(user: User, dto: CreateListDto) {
    const list = this.repo.create({ ...dto, user });
    return this.repo.save(list);
  }

  findAll(user: User) {
    return this.repo.find({ where: { user }, relations: ['items'] });
  }

  async findOne(id: string, user: User) {
    const list = await this.repo.findOne({ where: { id, user }, relations: ['items'] });
    if (!list) throw new NotFoundException('Top non trouvé');
    return list;
  }

  async update(id: string, user: User, dto: UpdateListDto) {
    const list = await this.findOne(id, user);
    Object.assign(list, dto);
    return this.repo.save(list);
  }

  async remove(id: string, user: User) {
    const list = await this.findOne(id, user);
    await this.repo.remove(list);
    return { deleted: true };
  }
}
