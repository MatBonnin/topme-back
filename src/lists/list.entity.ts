import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Item } from '../items/item.entity';
import { User } from '../users/user.entity';

export enum Category {
  FILMS = 'films',
  BOUFFE = 'bouffe',
  VOITURES = 'voitures',
  COULEURS = 'couleurs',
}

@Entity()
export class List {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: Category })
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
