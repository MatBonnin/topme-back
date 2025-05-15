import { Item } from './item.entity';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { ListsModule } from '../lists/lists.module';
import { LookupModule } from '../lookup/lookup.module';
// src/items/items.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item]),
    ListsModule,   // pour récupérer la List associée
    LookupModule,  // pour accéder à LookupService
  ],
  providers: [ItemsService],
  controllers: [ItemsController],
})
export class ItemsModule {}
