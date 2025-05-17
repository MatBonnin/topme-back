import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('lists/:listId/items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private itemsService: ItemsService) {}

  @Post()
  create(@Param('listId') listId: string, @Body() dto: CreateItemDto & { lang: string }) {
    console.log('create item', dto);
    console.log('listId', listId);

    return this.itemsService.create(listId, dto);
  }

  @Get()
  findAll(@Param('listId') listId: string) {
    return this.itemsService.findAll(listId);
  }

  @Patch(':itemId')
  update(
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto & { lang: string }
  ) {
    return this.itemsService.update(listId, itemId, dto);
  }

  @Delete(':itemId')
  remove(@Param('listId') listId: string, @Param('itemId') itemId: string) {
    return this.itemsService.remove(listId, itemId);
  }
}
