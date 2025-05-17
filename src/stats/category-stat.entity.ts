import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('category_stat')
export class CategoryStat {
  @PrimaryColumn()
  categoryId: string;

  @Column('int')
  listCount: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
