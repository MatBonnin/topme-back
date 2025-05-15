import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { List } from '../lists/list.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  rank: number;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => List, list => list.items, { onDelete: 'CASCADE' })
  list: List;
}
