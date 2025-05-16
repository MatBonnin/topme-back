// src/validation/validation.controller.ts

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard }                     from '../auth/jwt-auth.guard';
import { ValidationService }                from './validation.service';

class ValidateDto {
  category: string;
  items: string[];
}

@Controller('validate')
@UseGuards(JwtAuthGuard)
export class ValidationController {
  constructor(private vs: ValidationService) {}

  @Post()
  async batchValidate(@Body() dto: ValidateDto) {
    return this.vs.validateItems(dto.category, dto.items);
  }
}
