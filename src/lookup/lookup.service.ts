// src/lookup/lookup.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { NamedEntity } from './named-entity.entity';

@Injectable()
export class LookupService {
  private unsplashKey: string;

  constructor(
    @InjectRepository(NamedEntity)
    private readonly namedRepo: Repository<NamedEntity>,
    private readonly http: HttpService,
    private readonly cfg: ConfigService,
  ) {
    this.unsplashKey = this.cfg.get<string>('UNSPLASH_ACCESS_KEY')!;
    if (!this.unsplashKey) {
      throw new Error('UNSPLASH_ACCESS_KEY non défini');
    }
  }

  /**
   * Retourne l'image pour "query" en réutilisant le cache si possible.
   */
  async fetchImageFor(query: string): Promise<string | null> {
    const normalized = query.trim().toLowerCase();

    // 1) Cherche dans le cache
    const existing = await this.namedRepo.findOne({ where: { name: normalized } });
    if (existing) {
      return existing.imageUrl;
    }

    // 2) Sinon, appelle Unsplash
    const url = 'https://api.unsplash.com/search/photos';
    const params = { query, per_page: 1, orientation: 'squarish' };
    const response: AxiosResponse = await firstValueFrom(
      this.http.get(url, {
        params,
        headers: { Authorization: `Client-ID ${this.unsplashKey}` },
      }),
    );
    const results = response.data.results as any[];
    if (results.length === 0) {
      return null;
    }
    const imageUrl = results[0].urls.small as string;

    // 3) Enregistre dans le cache
    const entity = this.namedRepo.create({ name: normalized, imageUrl });
    await this.namedRepo.save(entity);

    return imageUrl;
  }
}
