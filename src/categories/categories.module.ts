// src/categories/categories.module.ts

import { CategoriesController } from './categories.controller';
import { CategoriesService }    from './categories.service';
import { Category }       from './category.entity';
import { Module } from '@nestjs/common';
import { TranslateModule } from 'src/translate/translate.module';
import { TypeOrmModule }  from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),TranslateModule,
  ],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService],    // ← ajoute cette ligne
})
export class CategoriesModule {}
