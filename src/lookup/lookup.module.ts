import { HttpModule } from '@nestjs/axios';
import { LookupController } from './lookup.controller';
import { LookupService } from './lookup.service';
// src/lookup/lookup.module.ts
import { Module } from '@nestjs/common';
import { NamedEntity } from './named-entity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([NamedEntity]),
  ],
  providers: [LookupService],
  controllers: [LookupController],
  exports: [LookupService],
})
export class LookupModule {}
