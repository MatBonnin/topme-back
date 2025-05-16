// src/lists/lists.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository }              from '@nestjs/typeorm';
import { Repository }                    from 'typeorm';
import { List }                          from './list.entity';
import { CreateListDto }                 from './dto/create-list.dto';
import { UpdateListDto }                 from './dto/update-list.dto';
import { User }                          from '../users/user.entity';
import { Category } from 'src/categories/category.entity';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List) private repo: Repository<List>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>, // ⬅️ injecte le repo Category
  ) {}

  async create(user: User, dto: CreateListDto) {
    const category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
    if (!category) throw new NotFoundException('Catégorie introuvable');

    const list = this.repo.create({
      title: dto.title,
      user,
      category, // ⬅️ passe l’objet entier
    });

    return this.repo.save(list);
  }

  findAll(user: User) {
    return this.repo.find({
      where: { user },
      relations: ['items', 'category'],
    });
  }

  /** Récupère toutes les listes d’un user pour une catégorie */
  async findByCategory(user: User, categoryId: string) {
    const lists = await this.repo.find({
      where: {
        user,
        category: { id: categoryId },
      },
      relations: ['items', 'category'],
    });
    console.log('lists', lists);
    if (!lists.length) {
      console.log('Aucun top 5 trouvé pour cette catégorie.');
      throw new NotFoundException('Aucun top 5 trouvé pour cette catégorie.');
    }
  
    // Tu pourrais en renvoyer plusieurs, mais si tu n’en autorises qu’un :
    return lists[0]; // ou return lists si tu veux garder un tableau
  }
  

  async findOne(id: string, user: User) {
    const list = await this.repo.findOne({
      where: { id, user },
      relations: ['items', 'category'],
    });
    if (!list) throw new NotFoundException('Top non trouvé');
    return list;
  }

  async update(id: string, user: User, dto: UpdateListDto) {
    const list = await this.findOne(id, user);
  
    if (dto.categoryId) {
      const category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
      if (!category) throw new NotFoundException('Catégorie introuvable');
      list.category = category;
    }
  
    if (dto.title) {
      list.title = dto.title;
    }
  
    return this.repo.save(list);
  }
  

  async remove(id: string, user: User) {
    const list = await this.findOne(id, user);
    await this.repo.remove(list);
    return { deleted: true };
  }
}
