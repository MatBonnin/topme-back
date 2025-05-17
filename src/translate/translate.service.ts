// src/translate/translate.service.ts

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TranslateService {
  constructor(private readonly http: HttpService) {}

  async toEnglish(text: string, sourceLang: string): Promise<string> {
    const res = await firstValueFrom(
      this.http.post(
        process.env.LIBRETRANSLATE_URL || 'http://localhost:8080/translate',
        {
          q: text,
          source: sourceLang,
          target: 'en',
        },
        { headers: { 'Content-Type': 'application/json' } },
      )
    );
    if (!res || !res.data) {
      throw new Error('Translation response is undefined or invalid');
    }
    return res.data.translatedText as string;
  }

  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    const res = await firstValueFrom(
      this.http.post(
        process.env.LIBRETRANSLATE_URL || 'http://localhost:8080/translate',
        {
          q: text,
          source: sourceLang,
          target: targetLang,
        },
        { headers: { 'Content-Type': 'application/json' } },
      )
    );
    if (!res || !res.data) {
      throw new Error('Translation response is undefined or invalid');
    }
    return res.data.translatedText as string;
  }
}
