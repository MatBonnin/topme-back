// src/items/items.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ListsService } from '../lists/lists.service';
import { LookupService } from '../lookup/lookup.service';
import { TranslateService } from 'src/translate/translate.service';
import { User } from '../users/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly repo: Repository<Item>,
    private readonly listsService: ListsService,
    private readonly lookupService: LookupService,
    private readonly translate: TranslateService,
  ) {}

  /**
   * Crée un nouvel item dans la liste, puis lance en tâche de fond
   * la récupération automatisée d'une image.
   */
  async create(listId: string, user: User, dto: CreateItemDto & { lang: string }) {
    // 1) Traduction en anglais
    const englishName = await this.translate.toEnglish(dto.name, dto.lang);

    // 2) Créer l’item en base avec englishName
    const item = this.repo.create({
      list: await this.listsService.findOne(listId, user),
      name: englishName,
      rank: dto.rank,
      // pas dto.name
    });
    await this.repo.save(item);

    // 3) Lookup image via englishName
    this.lookupService.fetchImageFor(englishName) ;

    // 4) Mettre à jour les fichiers i18n  
    this.emitTranslationFiles(englishName, dto.name);

    return item;
  }

  private async emitTranslationFiles(eng: string, original: string) {
    const langs = ['en', 'fr', 'es'];
    for (const lang of langs) {
      // 1) si lang==='en', value=eng, sinon on traduit en target lang
      let value: string;
      if (lang === 'en') {
        value = eng;
      } else {
        // On traduit de l'anglais vers la langue cible
        value = await this.translate.translate(eng, 'en', lang);
      }
      // 2) charger le JSON
      const file = path.join(__dirname, '../i18n/locales', `${lang}.json`);
      let obj: any = {};
      try {
        obj = JSON.parse(fs.readFileSync(file, 'utf-8'));
      } catch {
        obj = {};
      }
      // 3) ajouter ou écraser "items.<englishName>" = value
      obj.items = obj.items || {};
      obj.items[eng] = value;
      // 4) réécrire le JSON
      fs.writeFileSync(file, JSON.stringify(obj, null, 2));
    }
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
  async update(
    listId: string,
    itemId: string,
    user: User,
    dto: UpdateItemDto & { lang: string },
  ) {
    const item = await this.repo.findOne({
      where: { id: itemId, list: { id: listId, user } },
      relations: ['list'],
    });
    if (!item) {
      throw new NotFoundException('Élément non trouvé');
    }

    // Traduire le nom en anglais si présent dans le DTO
    if (dto.name && dto.lang) {
      const englishName = await this.translate.toEnglish(dto.name, dto.lang);
      item.name = englishName;
      // Mettre à jour les fichiers i18n
      this.emitTranslationFiles(englishName, dto.name);
    }

    // Appliquer les autres champs du DTO (hors name/lang)
    Object.assign(item, { ...dto, name: item.name });

    return this.repo.save(item);
  }

  /**
   * Supprime un item.
   */
  async remove(listId: string, itemId: string, user: User) {
    const item = await this.repo.findOne({
      where: { id: itemId, list: { id: listId, user } },
      relations: ['list'],
    });
    if (!item) {
      throw new NotFoundException('Élément non trouvé');
    }
    await this.repo.remove(item);
    return { deleted: true };
  }
}
