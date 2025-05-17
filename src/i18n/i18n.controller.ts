// src/i18n/i18n.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { readFileSync }            from 'fs';
import { join }                    from 'path';

@Controller('i18n')
export class I18nController {
  @Get(':lang')
  getTranslations(@Param('lang') lang: string) {
    const file = join(__dirname, 'locales', `${lang}.json`);
    try {
      const content = readFileSync(file, 'utf-8');
      return JSON.parse(content);
    } catch {
      // si langue inconnue, retourne l’anglais par défaut
      const fallback = readFileSync(join(__dirname, 'locales', 'en.json'), 'utf-8');
      return JSON.parse(fallback);
    }
  }
}
