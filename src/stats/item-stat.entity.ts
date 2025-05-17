import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('item_stat')
export class ItemStat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  categoryId: string;

  @Column()
  item: string;

  @Column('int')
  score: number;

  @Column('int')
  appearances: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
