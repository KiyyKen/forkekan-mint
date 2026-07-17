import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { HistoryQueryDto } from './dto/history-query.dto';
import { HistoryItem, HistoryService } from './history.service';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload, @Query() query: HistoryQueryDto): Promise<HistoryItem[]> {
    return this.historyService.list(user.sub, query);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.historyService.remove(user.sub, id);
  }
}
