// src/categories/categories.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository }                from '@nestjs/typeorm';
import { Repository }                      from 'typeorm';
import { Category }                        from './category.entity';
import { CreateCategoryDto }               from './dto/create-category.dto';
import { UpdateCategoryDto }               from './dto/update-category.dto';
import { ConfigService }                   from '@nestjs/config';
import OpenAI                              from 'openai';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join }                            from 'path';
import axios                               from 'axios';
import { TranslateService } from 'src/translate/translate.service';
import * as fs from 'fs';
import * as path from 'path';
import { DailyTopCategory } from './daily-top-category.entity';
import { ListsService } from '../lists/lists.service';
import { User } from '../users/user.entity';

@Injectable()
export class CategoriesService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
    @InjectRepository(DailyTopCategory) private dailyTopRepo: Repository<DailyTopCategory>,
    private readonly cfg: ConfigService,
    private readonly translate: TranslateService,
    private readonly listsService: ListsService, // injection ListsService
  ) {
    const apiKey = this.cfg.get<string>('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY manquant');
    this.openai = new OpenAI({
      apiKey: this.cfg.get<string>('OPENAI_API_KEY'),
      organization: this.cfg.get<string>('OPENAI_ORG_ID'), // <- on va le charger depuis .env
    });
  }

  /**
   * Crée une catégorie + génère un icône via GPT Image 1 Low,
   * l'enregistre dans public/images/categories/<name>-icon.png
   * et met à jour imageUrl.
   * dto doit contenir { name: string, lang: string }
   */
  async create(dto: CreateCategoryDto & { lang: string }): Promise<Category> {
    // 1) Traduction en anglais si nécessaire
    const englishName = dto.lang && dto.lang !== 'en'
      ? await this.translate.toEnglish(dto.name, dto.lang)
      : dto.name;
    const name = englishName.toLowerCase().trim();

    // 2) création initiale pour obtenir un ID
    let cat = this.repo.create({ name });
    cat = await this.repo.save(cat);

    // 3) Mise à jour fichiers i18n
    await this.emitTranslationFiles(name, dto.name, dto.lang);

    try {
      // 2) génération de l'image
      const prompt = `genere un icon flat design coloré qui represente "${name}", sans text, png en fond transparant `;
      
      const gen = await this.openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        size: '1024x1024',
        n: 1,
      });

      if (!gen.data || gen.data.length === 0) {
        throw new Error('Pas de données retournées par OpenAI');
      }
      const b64 = gen.data[0].b64_json;
      if (!b64) throw new Error('Pas de base64 retourné');

      // 3) décodage base64 et écriture sur disque
      const folder = join(process.cwd(), 'public', 'images', 'categories');
      if (!existsSync(folder)) mkdirSync(folder, { recursive: true });

      const filename = `${name}-icon.png`;
      const filepath = join(folder, filename);
      writeFileSync(filepath, Buffer.from(b64, 'base64'), 'binary');

      // 4) mise à jour de la catégorie
      cat.imageUrl = `/static/images/categories/${filename}`;
      cat = await this.repo.save(cat);
    } catch (err) {
      console.error('Génération icône échouée pour', name, err);
      // on garde la catégorie sans icône si erreur
    }

    return cat;
  }

  /**
   * Met à jour une catégorie, traduit le nom si besoin, et met à jour les fichiers i18n.
   * dto doit contenir { name?: string, lang?: string }
   */
  async update(id: string, dto: UpdateCategoryDto & { lang?: string }): Promise<Category> {
    const cat = await this.findOne(id);
    if (dto.name) {
      const englishName = dto.lang && dto.lang !== 'en'
        ? await this.translate.toEnglish(dto.name, dto.lang)
        : dto.name;
      cat.name = englishName.toLowerCase().trim();
      await this.emitTranslationFiles(cat.name, dto.name, dto.lang);
    }
    if (dto.imageUrl !== undefined) {
      cat.imageUrl = dto.imageUrl.trim() || undefined;
    }
    return this.repo.save(cat);
  }

  /**
   * Met à jour les fichiers i18n pour chaque langue.
   * @param eng Nom anglais (clé)
   * @param original Nom original (valeur pour la langue source)
   * @param sourceLang Langue source
   */
  private async emitTranslationFiles(eng: string, original: string, sourceLang?: string) {
    const langs = ['en', 'fr', 'es'];
    for (const lang of langs) {
      let value: string;
      if (lang === 'en') {
        value = eng;
      } else if (lang === sourceLang) {
        value = original;
      } else {
        value = await this.translate.translate(eng, 'en', lang);
      }
      // Charger le JSON
      const file = path.join(__dirname, '../i18n/locales', `${lang}.json`);
      let obj: any = {};
      try {
        obj = JSON.parse(fs.readFileSync(file, 'utf-8'));
      } catch {
        obj = {};
      }
      obj.categories = obj.categories || {};
      obj.categories[eng] = value;
      fs.writeFileSync(file, JSON.stringify(obj, null, 2));
    }
  }

  findAll(): Promise<Category[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Category> {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Catégorie introuvable');
    return cat;
  }

  async remove(id: string): Promise<{ deleted: true }> {
    const cat = await this.findOne(id);
    await this.repo.remove(cat);
    return { deleted: true };
  }


  /**
   * Retourne une catégorie du jour propre à l'utilisateur, persistée en base (DailyTopCategory)
   */
  async getTopCategoryOfTheDayWithUser(user: User): Promise<{ category: Category | null, hasFilled: boolean }> {
    if (!user || !user.id) return { category: null, hasFilled: false };
    // 1. Vérifier si un DailyTopCategory existe déjà pour cet utilisateur aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let dailyTop = await this.dailyTopRepo.findOne({ where: { user: { id: user.id }, date: today } });
    let category: Category | null = null;
    if (dailyTop) {
      category = dailyTop.category;
    } else {
      // 2. Récupérer toutes les catégories déjà faites par l'utilisateur
      const userLists = await this.listsService.findAll(user);
      const doneCategoryIds = userLists.map(l => l.category.id);
      // 3. Récupérer toutes les catégories non faites
      const allCategories = await this.repo.find();
      const available = allCategories.filter(cat => !doneCategoryIds.includes(cat.id));
      if (available.length === 0) return { category: null, hasFilled: false };
      // 4. Choisir une catégorie aléatoire parmi celles non faites
      const idx = Math.floor(Math.random() * available.length);
      category = available[idx];
      // 5. Persister le DailyTopCategory pour l'utilisateur
      dailyTop = this.dailyTopRepo.create({ user, category, date: today });
      await this.dailyTopRepo.save(dailyTop);
    }
    // 6. Vérifier si l'utilisateur a déjà rempli cette catégorie
    const userLists = await this.listsService.findAll(user);
    const doneCategoryIds = userLists.map(l => l.category.id);
    const hasFilled = !!category && doneCategoryIds.includes(category.id);
    return { category, hasFilled };
  }
}
