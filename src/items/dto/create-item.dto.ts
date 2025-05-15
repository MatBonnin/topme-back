import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateItemDto {
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  rank: number;
}
