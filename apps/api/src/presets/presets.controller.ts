import { Controller, Get } from '@nestjs/common';

import { PresetsService, PresetSummary } from './presets.service';

@Controller('presets')
export class PresetsController {
  constructor(private readonly presetsService: PresetsService) {}

  @Get()
  findAll(): Promise<PresetSummary[]> {
    return this.presetsService.findAll();
  }
}
