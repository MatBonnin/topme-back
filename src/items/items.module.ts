import { Item } from './item.entity';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { ListsModule } from '../lists/lists.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item]),
    ListsModule, // pour pouvoir charger la liste par son id
  ],
  providers: [ItemsService],
  controllers: [ItemsController],
})
export class ItemsModule {}
