import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Category } from '../categories/category.entity';
import { Item } from '../items/item.entity';
import { User } from '../users/user.entity';

@Entity()
export class List {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @ManyToOne(() => Category, category => category.lists, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  category: Category;

  @ManyToOne(() => User, user => user.lists, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Item, item => item.list, { cascade: true })
  items: Item[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

