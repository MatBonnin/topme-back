import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

import { Category } from '../list.entity';

export class CreateListDto {
  @IsNotEmpty()
  title: string;

  @IsEnum(Category)
  category: Category;
}
