import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

import { Category } from 'src/categories/category.entity';

export class CreateListDto {
  @IsNotEmpty()
  title: string;

  @IsEnum(Category)
  category: Category;
}
