// src/categories/categories.module.ts

import { CategoriesController } from './categories.controller';
import { CategoriesService }    from './categories.service';
import { Category }       from './category.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule }  from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
  ],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService],    // ← ajoute cette ligne
})
export class CategoriesModule {}
