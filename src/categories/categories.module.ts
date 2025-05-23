// src/categories/categories.module.ts

import { CategoriesController } from './categories.controller';
import { CategoriesService }    from './categories.service';
import { Category }       from './category.entity';
import { DailyTopCategory } from './daily-top-category.entity';
import { ListsModule } from '../lists/lists.module';
import { Module } from '@nestjs/common';
import { TranslateModule } from 'src/translate/translate.module';
import { TypeOrmModule }  from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, DailyTopCategory]),
    TranslateModule,
    ListsModule, // <-- Ajout de l'import du module ListsModule pour injecter ListsService
  ],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
