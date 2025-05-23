// src/users/user.entity.ts

import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Friendship } from '../friendship/friendship.entity';
import { List } from '../lists/list.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  facebookId?: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @OneToMany(() => List, list => list.user)
  lists: List[];

  @OneToMany(() => Friendship, f => f.requester)
  sentFriendRequests: Friendship[];

  @OneToMany(() => Friendship, f => f.addressee)
  receivedFriendRequests: Friendship[];
}
