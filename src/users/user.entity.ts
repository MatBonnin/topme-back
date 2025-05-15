import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { List } from '../lists/list.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @OneToMany(() => List, list => list.user)
  lists: List[];   // ← ajoute cette ligne
}
