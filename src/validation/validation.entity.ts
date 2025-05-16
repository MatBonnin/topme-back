// src/validation/validation.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index(['category', 'item'], { unique: true })
export class Validation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category: string;

  @Column()
  item: string;

  @Column()
  isValid: boolean;

  @CreateDateColumn()
  validatedAt: Date;
}
