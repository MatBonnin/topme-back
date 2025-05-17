import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CategoryStat } from './category-stat.entity';
import { ItemStat } from './item-stat.entity';
import { List } from '../lists/list.entity';
import { Item } from '../items/item.entity';
import { Category } from '../categories/category.entity';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    @InjectRepository(CategoryStat)
    private readonly catStatRepo: Repository<CategoryStat>,
    @InjectRepository(ItemStat)
    private readonly itemStatRepo: Repository<ItemStat>,
    @InjectRepository(List)
    private readonly listRepo: Repository<List>,
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  /** Toutes les heures à minute 0 */
  @Cron('0 * * * *')
  async handleHourlyStats() {
    this.logger.log('🕑 Lancement du recalcul des stats globales…');
    // 1) Catégories
    const rawCat = await this.listRepo
      .createQueryBuilder('l')
      .select('l.categoryId', 'categoryId')
      .addSelect('COUNT(*)','listCount')
      .groupBy('l.categoryId')
      .getRawMany<{ categoryId: string; listCount: number }>();

    // On remplace tout
    await this.catStatRepo.clear();
    for (const row of rawCat) {
      await this.catStatRepo.save({
        categoryId: row.categoryId,
        listCount: +row.listCount,
      });
    }

    // 2) Pour chaque catégorie on calcule top items
    const catIds = rawCat.map(r => r.categoryId);
    // Vider anciens
    await this.itemStatRepo.delete({ categoryId: In(catIds) });

    for (const catId of catIds) {
      const rawItems = await this.itemRepo
        .createQueryBuilder('i')
        .innerJoin('i.list', 'l')
        .select('i.name', 'item')
        .addSelect(`
          SUM(
            CASE i.rank
              WHEN 1 THEN 5
              WHEN 2 THEN 4
              WHEN 3 THEN 3
              WHEN 4 THEN 2
              WHEN 5 THEN 1
              ELSE 0 END
          )`, 'score')
        .addSelect('COUNT(*)','appearances')
        .where('l.categoryId = :catId', { catId })
        .groupBy('i.name')
        .orderBy('score','DESC')
        .limit(20)
        .getRawMany<{ item: string; score: number; appearances: number }>();

      for (const it of rawItems) {
        await this.itemStatRepo.save({
          categoryId: catId,
          item: it.item,
          score: +it.score,
          appearances: +it.appearances,
        });
      }
    }

    this.logger.log('✅ Statistiques globales mises à jour.');
  }

  // lecture depuis la base
  async getCategoryStats() {
    return this.catStatRepo.find({ order: { listCount: 'DESC' } });
  }

  async getItemStats(categoryId: string) {
    return this.itemStatRepo.find({
      where: { categoryId },
      order: { score: 'DESC' },
      take: 20,
    });
  }

  async getCategoryStatsWithNames() {
    const stats = await this.catStatRepo.find({ order: { listCount: 'DESC' } });
    const ids = stats.map(s => s.categoryId);
    const cats = await this.categoryRepo.findByIds(ids);
    const idToCat = Object.fromEntries(cats.map(c => [c.id, c]));
    return stats.map(s => ({
      ...s,
      name: idToCat[s.categoryId]?.name ?? null,
      imageUrl: idToCat[s.categoryId]?.imageUrl ?? null, // ← ajoute imageUrl
    }));
  }
}
