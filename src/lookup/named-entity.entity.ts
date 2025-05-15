// src/lookup/named-entity.entity.ts

import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NamedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
