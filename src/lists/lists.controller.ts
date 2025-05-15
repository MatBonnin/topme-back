import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';

@Controller('lists')
@UseGuards(JwtAuthGuard)
export class ListsController {
  constructor(private listsService: ListsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateListDto) {
    return this.listsService.create(req.user, dto);
  }

  @Get()
  findAll(@Req() req) {
    return this.listsService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.listsService.findOne(id, req.user);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateListDto) {
    return this.listsService.update(id, req.user, dto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.listsService.remove(id, req.user);
  }
}
