// src/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';


@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  create(dto: CreateCategoryDto) {
    const cat = this.repo.create({ name: dto.name.toLowerCase().trim() });
    return this.repo.save(cat);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Catégorie introuvable');
    return cat;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.findOne(id);
    if (dto.name) cat.name = dto.name.toLowerCase().trim();
    return this.repo.save(cat);
  }

  async remove(id: string) {
    const cat = await this.findOne(id);
    await this.repo.remove(cat);
    return { deleted: true };
  }
}
