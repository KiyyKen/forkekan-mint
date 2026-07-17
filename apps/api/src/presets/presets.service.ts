import { Injectable } from '@nestjs/common';

import { PresetsRepository } from './presets.repository';

/** Bentuk item GET /presets — docs/07-api-specification.md. */
export interface PresetSummary {
  id: string;
  name: string;
  slug: string;
  resolution: string;
}

@Injectable()
export class PresetsService {
  constructor(private readonly presetsRepository: PresetsRepository) {}

  async findAll(): Promise<PresetSummary[]> {
    const presets = await this.presetsRepository.findAll();

    return presets.map((preset) => ({
      id: preset.id,
      name: preset.name,
      slug: preset.slug,
      resolution: preset.targetResolution,
    }));
  }
}
