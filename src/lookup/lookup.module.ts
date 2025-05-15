import { HttpModule } from '@nestjs/axios';
import { LookupController } from './lookup.controller';
import { LookupService } from './lookup.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [HttpModule],
  providers: [LookupService],
  controllers: [LookupController],
  exports: [LookupService],
})
export class LookupModule {}
 