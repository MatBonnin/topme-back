// src/validation/validation.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi }         from 'openai';

import { ConfigService }                    from '@nestjs/config';

@Injectable()
export class ValidationService {
  private client: OpenAIApi;
  private cache: Record<string, boolean> = {};

  constructor(private cfg: ConfigService) {
    const key = this.cfg.get<string>('OPENAI_API_KEY');
    if (!key) throw new Error('OPENAI_API_KEY manquant');
    this.client = new OpenAIApi(new Configuration({ apiKey: key }));
  }

  private cacheKey(category: string, item: string) {
    return `${category.toLowerCase()}:${item.toLowerCase()}`;
  }

  async validateItem(category: string, item: string): Promise<boolean> {
    const key = this.cacheKey(category, item);
    if (this.cache[key] !== undefined) {
      return this.cache[key];
    }

    const { data } = await this.client.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: 0.0,
      max_tokens: 1,
      messages: [
        { role: 'system', content: 'You are a strict validator. Answer ONLY "Yes" or "No".' },
        { role: 'user',   content: `Is "${item}" a valid example of the category "${category}"?` },
      ],
    });

    const reply = data.choices[0].message?.content.trim().toLowerCase();
    let ok: boolean;
    if (reply === 'yes') ok = true;
    else if (reply === 'no') ok = false;
    else throw new BadRequestException(`Validation IA inattendue : "${reply}"`);

    this.cache[key] = ok;
    return ok;
  }
}
