import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Category } from './category.entity';
import { User } from '../users/user.entity';

@Entity()
export class DailyTopCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Category, { eager: true, onDelete: 'CASCADE' })
  category: Category;

  @CreateDateColumn()
  date: Date;
}
