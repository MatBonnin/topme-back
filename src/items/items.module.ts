import { Item } from './item.entity';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { ListsModule } from '../lists/lists.module';
import { LookupModule } from 'src/lookup/lookup.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item]),
    ListsModule,
    LookupModule  // pour pouvoir charger la liste par son id
  ],
  providers: [ItemsService],
  controllers: [ItemsController],
})
export class ItemsModule {}
