import { CreateListDto } from './create-list.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateListDto extends PartialType(CreateListDto) {}
