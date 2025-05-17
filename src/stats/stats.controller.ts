import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('categories')
  async getCategories() {
    // Renvoie [{ categoryId, listCount, completedCount, name, imageUrl }]
    return this.stats.getCategoryStatsWithNames();
  }

  @Get('categories/:id/items')
  getItems(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.stats.getItemStats(id);
  }
}
