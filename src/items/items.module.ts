import { Item } from './item.entity';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { ListsModule } from '../lists/lists.module';
import { LookupModule } from '../lookup/lookup.module';
import { Module } from '@nestjs/common';
import { TranslateModule } from 'src/translate/translate.module';
import { TypeOrmModule } from '@nestjs/typeorm';

// src/items/items.module.ts




@Module({
  imports: [
    TypeOrmModule.forFeature([Item]),
    ListsModule,   // pour récupérer la List associée
    LookupModule,
    TranslateModule,  
  ],
  providers: [ItemsService],
  controllers: [ItemsController],
})
export class ItemsModule {}
