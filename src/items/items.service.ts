import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ListsService } from '../lists/lists.service';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item) private repo: Repository<Item>,
    private listsService: ListsService,
  ) {}

  async create(listId: string, dto: CreateItemDto) {
    const list = await this.listsService.findOne(listId, dto['user']);
    const item = this.repo.create({ ...dto, list });
    return this.repo.save(item);
  }

  findAll(listId: string) {
    return this.repo.find({ where: { list: { id: listId } }, order: { rank: 'ASC' } });
  }

  async update(listId: string, itemId: string, dto: UpdateItemDto) {
    const item = await this.repo.findOne({ where: { id: itemId, list: { id: listId } } });
    if (!item) throw new NotFoundException('Élément non trouvé');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(listId: string, itemId: string) {
    const item = await this.repo.findOne({ where: { id: itemId, list: { id: listId } } });
    if (!item) throw new NotFoundException('Élément non trouvé');
    await this.repo.remove(item);
    return { deleted: true };
  }
}
