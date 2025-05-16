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
  private translateUrl: string;

  constructor(
    @InjectRepository(NamedEntity)
    private readonly namedRepo: Repository<NamedEntity>,
    private readonly http: HttpService,
    private readonly cfg: ConfigService,
  ) {
    // Ta clé Unsplash
    this.unsplashKey = this.cfg.get<string>('UNSPLASH_ACCESS_KEY')!;
    if (!this.unsplashKey) {
      throw new Error('UNSPLASH_ACCESS_KEY non défini');
    }

    // URL de ton serveur LibreTranslate local
    this.translateUrl = this.cfg.get<string>('TRANSLATE_API_URL')
      ?? 'http://localhost:8080/translate';
  }

  /**
   * Recherche (avec cache) une image pour la query.
   * Si la query semble en français, on la traduit en anglais avant d'appeler Unsplash.
   */
  async fetchImageFor(query: string): Promise<string | null> {
    const normalized = query.trim().toLowerCase();

    // 1) Check cache
    const cached = await this.namedRepo.findOne({ where: { name: normalized } });
    if (cached) return cached.imageUrl;

    // 2) Détection rapide du français (accentués)  
    const needsTranslation = /[àâéêèùûôçœ]/i.test(normalized);
    let searchTerm = normalized;

    if (needsTranslation) {
      try {
        const translateResponse: AxiosResponse = await firstValueFrom(
          this.http.post(this.translateUrl, {
            q: normalized,
            source: 'fr',
            target: 'en',
          }, {
            headers: { 'Content-Type': 'application/json' },
          })
        );
        // LibreTranslate renvoie { translatedText: "car" }
        searchTerm = translateResponse.data.translatedText || normalized;
      } catch (err) {
        console.warn(`Traduction échouée pour "${normalized}", on continue sans traduire.`);
      }
    }

    // 3) Appel Unsplash
    const unsplashUrl = 'https://api.unsplash.com/search/photos';
    const params = { query: searchTerm, per_page: 1, orientation: 'squarish' };
    const unsplashRes: AxiosResponse = await firstValueFrom(
      this.http.get(unsplashUrl, {
        params,
        headers: { Authorization: `Client-ID ${this.unsplashKey}` },
      })
    );

    const results = unsplashRes.data.results as any[];
    if (results.length === 0) return null;
    const imageUrl = results[0].urls.small as string;

    // 4) Enregistre dans le cache
    const entity = this.namedRepo.create({ name: normalized, imageUrl });
    await this.namedRepo.save(entity);

    return imageUrl;
  }
}
