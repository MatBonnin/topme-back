// src/categories/categories.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';


@Controller('categories')
@UseGuards(JwtAuthGuard)  // ou pas, selon si tu ouvres en lecture seule
export class CategoriesController {
  constructor(private readonly svc: CategoriesService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get('top-of-the-day')
  async getTopCategoryOfTheDay(@Req() req: RequestWithUser) {
    return this.svc.getTopCategoryOfTheDayWithUser(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCategoryDto & { lang: string }) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto & { lang?: string }) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
