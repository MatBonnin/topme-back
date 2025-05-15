import { Controller, Get, Query } from '@nestjs/common';
import { LookupService } from './lookup.service';

@Controller('lookup')
export class LookupController {
  constructor(private readonly lookup: LookupService) {}

  @Get()
  async suggest(@Query('q') q: string) {
    const img = await this.lookup.fetchImageFor(q);
    return { query: q, imageUrl: img };
  }
}
