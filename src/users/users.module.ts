// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),  // <-- ajoute ça
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],  // <-- pour que AuthModule puisse également l'utiliser
})
export class UsersModule {}
