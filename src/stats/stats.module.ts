import { CategoriesModule } from 'src/categories/categories.module';
import { Category } from 'src/categories/category.entity';
import { CategoryStat } from './category-stat.entity';
import { Item } from '../items/item.entity';
import { ItemStat } from './item-stat.entity';
import { List } from '../lists/list.entity';
import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryStat, ItemStat, List, Item, Category]),
    CategoriesModule,
  ],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
