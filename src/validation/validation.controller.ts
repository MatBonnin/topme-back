// src/validation/validation.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard }                     from '../auth/jwt-auth.guard';
import { ValidationService }                from './validation.service';

@Controller('validate')
@UseGuards(JwtAuthGuard)
export class ValidationController {
  constructor(private vs: ValidationService) {}

  @Get()
  async check(
    @Query('category') category: string,
    @Query('item') item: string,
  ) {
    const valid = await this.vs.validateItem(category, item);
    return { valid };
  }
}
