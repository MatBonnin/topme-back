// src/validation/validation.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository }                 from '@nestjs/typeorm';
import { In, Repository }                       from 'typeorm';
import OpenAI                                from 'openai';
import { ConfigService }                     from '@nestjs/config';
import { Validation }                        from './validation.entity';

@Injectable()
export class ValidationService {
  private client: OpenAI;

  constructor(
    private cfg: ConfigService,
    @InjectRepository(Validation)
    private readonly repo: Repository<Validation>,
  ) {
    const apiKey = this.cfg.get<string>('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY manquant');
    this.client = new OpenAI({ apiKey });
  }

  private cacheKey(category: string, item: string) {
    return `${category.toLowerCase()}:${item.toLowerCase()}`;
  }

  /**
   * Pour une catégorie et une liste d’items,
   * renvoie un objet { [item]: valid:boolean }.
   * Stocke et lit en base de données pour persistance.
   */
  async validateItems(
    category: string,
    items: string[],
  ): Promise<Record<string, boolean>> {
    const result: Record<string, boolean> = {};
    const toValidate: string[] = [];
    console.log('validateItems', category, items);
    // 1) Recherche en base
    const existing = await this.repo.find({
      where: { category, item: In(items) },
    });
    for (const v of existing) {
      result[v.item] = v.isValid;
    }

    // 2) Construire la liste à valider
    for (const it of items) {
      if (result[it] === undefined) {
        toValidate.push(it);
      }
    }
    console.log('toValidate', toValidate);


    // 3) Appel IA pour ceux qui manquent
    if (toValidate.length) {
      const userPrompt = `
Here is a category and a list of items.
Answer strictly in JSON mapping each item to true if it belongs, false otherwise.
Only output false if absolutely certain; otherwise true.

Category: "${category}"
Items: ${JSON.stringify(toValidate)}

Example:
{
  "Inception": true,
  "Tomate": false
}
      `.trim();

      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.0,
        max_tokens: 256,
        messages: [
          { role: 'system', content: 'You are a strict validator.' },
          { role: 'user', content: userPrompt },
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

      // 4) Persister et ajouter au résultat
      for (const it of toValidate) {
        const ok = parsed[it] ?? false;
        result[it] = ok;
        const record = this.repo.create({ category, item: it, isValid: ok });
        await this.repo.save(record);
      }
    }

    return result;
  }
}
