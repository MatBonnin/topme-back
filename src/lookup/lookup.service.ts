// src/lookup/lookup.service.ts

import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LookupService {
  private unsplashKey: string;

  constructor(
    private readonly http: HttpService,
    private readonly cfg: ConfigService,
  ) {
    this.unsplashKey = this.cfg.get<string>('UNSPLASH_ACCESS_KEY')!;
    if (!this.unsplashKey) {
      throw new Error('UNSPLASH_ACCESS_KEY non défini dans .env');
    }
  }

  /**
   * Recherche sur Unsplash la première image pour la query.
   * Retourne l’URL de la photo ou null.
   */
  async fetchImageFor(query: string): Promise<string | null> {
    const url = 'https://api.unsplash.com/search/photos';
    const params = {
      query,
      per_page: 1,
      orientation: 'squarish',  // ou 'portrait', 'landscape'
    };

    const response: AxiosResponse = await firstValueFrom(
      this.http.get(url, {
        params,
        headers: { Authorization: `Client-ID ${this.unsplashKey}` },
      }),
    );

    const results = response.data.results as any[];
    if (results.length === 0) return null;

    // Choix de la petite vignette medium (ex. 400px)
    return results[0].urls.small;  
  }
}
