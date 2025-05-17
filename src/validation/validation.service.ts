// src/validation/validation.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository }                 from '@nestjs/typeorm';
import { In, Repository }                   from 'typeorm';
import OpenAI                                from 'openai';
import { ConfigService }                     from '@nestjs/config';
import { Validation }                        from './validation.entity';
import { TranslateService }                  from '../translate/translate.service';

@Injectable()
export class ValidationService {
  private client: OpenAI;

  constructor(
    private cfg: ConfigService,
    @InjectRepository(Validation)
    private readonly repo: Repository<Validation>,
    private readonly translate: TranslateService,  // ← injection du service de traduction
  ) {
    const apiKey = this.cfg.get<string>('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY manquant');
    this.client = new OpenAI({ apiKey });
  }

  private cacheKey(category: string, item: string) {
    return `${category.toLowerCase()}:${item.toLowerCase()}`;
  }

  /**
   * Valide des items avec rank, retourne { [rank]: boolean }
   * @param category  la clé de catégorie (toujours en anglais)
   * @param items     liste d’items { rank, name }
   * @param lang      code de langue de saisie ("fr", "es", etc.)
   */
  async validateItems(
    category: string,
    items: { rank: number; name: string }[],
    lang: string,
  ): Promise<Record<number, boolean>> {
    // 0) Traduction de tous les items en anglais
    const englishItems = await Promise.all(
      items.map(i => this.translate.toEnglish(i.name, lang)),
    );
    // Associer chaque rank à son nom anglais
    const rankToEnglish: Record<number, string> = {};
    items.forEach((item, idx) => {
      rankToEnglish[item.rank] = englishItems[idx];
    });

    const result: Record<number, boolean> = {};
    const toValidate: { rank: number; eng: string }[] = [];

    // 1) Recherche en base des validations déjà existantes
    const existing = await this.repo.find({
      where: { category, item: In(englishItems) },
    });
    for (const [rank, eng] of Object.entries(rankToEnglish)) {
      const found = existing.find(e => e.item === eng);
      if (found) {
        result[Number(rank)] = found.isValid;
      } else {
        toValidate.push({ rank: Number(rank), eng });
      }
    }

    // 2) Appel IA pour ceux qui manquent
    if (toValidate.length > 0) {
      const itemsForPrompt = toValidate.map(i => `${i.rank}: ${i.eng}`).join(', ');
      const userPrompt = `
Here is a category and a list of items in English, each with a rank.
Return a JSON object mapping each rank (as a number) to true if the item belongs to the category, or false otherwise.
Only output false if absolutely certain; otherwise true.

Category: "${category}"
Items: { ${itemsForPrompt} }

Example:
{
  "1": true,
  "2": false
}
      `.trim();

      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.0,
        max_tokens: 256,
        messages: [
          { role: 'system', content: 'You are a strict validator.' },
          { role: 'user',   content: userPrompt },
        ],
      });

      const content = completion.choices[0].message?.content;
      if (!content) {
        throw new BadRequestException('Réponse IA invalide : contenu manquant');
      }
      const text = content.trim();
      let parsed: Record<string, boolean>;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new BadRequestException(`Réponse IA invalide : ${text}`);
      }

      // 3) Persister et ajouter au résultat
      for (const { rank, eng } of toValidate) {
        const ok = parsed[String(rank)] ?? false;
        result[rank] = ok;
        const record = this.repo.create({ category, item: eng, isValid: ok });
        await this.repo.save(record);
      }
    }
    // 4) Retourne { [rank]: boolean }
    return result;
  }
}
