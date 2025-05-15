// src/items/items.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ListsService } from '../lists/lists.service';
import { LookupService } from '../lookup/lookup.service';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly repo: Repository<Item>,
    private readonly listsService: ListsService,
    private readonly lookupService: LookupService,
  ) {}

  /**
   * Crée un nouvel item dans la liste, puis lance en tâche de fond
   * la récupération automatisée d'une image.
   */
  async create(listId: string, dto: CreateItemDto) {
    // 1. Récupérer la liste (avec gestion de droits si nécessaire)
    const list = await this.listsService.findOne(listId,dto['user']);

    // 2. Créer et sauvegarder l'item sans image
    const item = this.repo.create({ ...dto, list });
    await this.repo.save(item);

    // 3. En tâche de fond, fetch et met à jour imageUrl
    this.lookupService
      .fetchImageFor(dto.name)
      .then(async (imageUrl) => {
        if (imageUrl) {
          await this.repo.update(item.id, { imageUrl });
        }
      })
      .catch((err) => {
        // log ou gérer l'erreur sans bloquer la création
        console.error(`Lookup image failed for "${dto.name}":`, err);
      });

    return item;
  }

  /**
   * Retourne tous les items d'une liste, ordonnés par rang.
   */
  findAll(listId: string) {
    return this.repo.find({
      where: { list: { id: listId } },
      order: { rank: 'ASC' },
    });
  }

  /**
   * Met à jour un item existant.
   */
  async update(listId: string, itemId: string, dto: UpdateItemDto) {
    const item = await this.repo.findOne({
      where: { id: itemId, list: { id: listId } },
    });
    if (!item) {
      throw new NotFoundException('Élément non trouvé');
    }
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  /**
   * Supprime un item.
   */
  async remove(listId: string, itemId: string) {
    const item = await this.repo.findOne({
      where: { id: itemId, list: { id: listId } },
    });
    if (!item) {
      throw new NotFoundException('Élément non trouvé');
    }
    await this.repo.remove(item);
    return { deleted: true };
  }
}
