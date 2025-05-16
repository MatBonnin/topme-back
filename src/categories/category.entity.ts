// src/categories/category.entity.ts

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { List } from '../lists/list.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;    // “films”, “food”, “cars”, “colors”, etc.

  @OneToMany(() => List, list => list.category)
  lists: List[];
}
