import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

import { Category } from 'src/categories/category.entity';

export class CreateListDto {
  @IsNotEmpty()
  title: string;

  @IsUUID()
  categoryId: string;
}
