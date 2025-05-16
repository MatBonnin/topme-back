import { Category } from 'src/categories/category.entity';
import { List } from './list.entity';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([List,Category])],
  providers: [ListsService],
  controllers: [ListsController],
  exports: [ListsService],
})
export class ListsModule {}
