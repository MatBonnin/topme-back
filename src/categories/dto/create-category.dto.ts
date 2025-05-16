// src/categories/dto/create-category.dto.ts

import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;    // facultatif à la création
}
