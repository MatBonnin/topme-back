// src/categories/category.entity.ts

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { List } from '../lists/list.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  // Nouvel attribut pour l’URL de l’image
  @Column({ nullable: true })
  imageUrl?: string;

  @OneToMany(() => List, list => list.category)
  lists: List[];
}
