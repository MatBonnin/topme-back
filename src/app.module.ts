// src/app.module.ts

import { Module, OnModuleInit }      from '@nestjs/common';

import { AuthModule }                from './auth/auth.module';
import { CategoriesModule }          from './categories/categories.module';
import { CategoriesService }         from './categories/categories.service';
import { Category }                  from './categories/category.entity';
import { ConfigModule }              from '@nestjs/config';
import { I18nController } from './i18n/i18n.controller';
import { I18nModule } from './i18n/i18n.module';
import { ItemsModule }               from './items/items.module';
import { ListsModule }               from './lists/lists.module';
import { LookupModule }              from './lookup/lookup.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule }         from '@nestjs/serve-static';
import { StatsModule } from './stats/stats.module';
import { TranslateModule } from './translate/translate.module';
import { TranslateService } from './translate/translate.service';
import { TypeOrmModule }             from '@nestjs/typeorm';
import { UsersModule }               from './users/users.module';
import { ValidationModule } from './validation/validation.module';
import { ValidationService } from './validation/validation.service';
import { join }                      from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/static',
    }),

    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),

    AuthModule,
    UsersModule,
    CategoriesModule,
    ListsModule,
    ItemsModule,
    LookupModule,
    ValidationModule,
    I18nModule,
    TranslateModule,
    ScheduleModule.forRoot(),
    StatsModule,
  ],
  providers: [],
  controllers: [],
  // Pas besoin de providers ici, on utilisera CategoriesService
})
export class AppModule implements OnModuleInit {
  constructor(private readonly categoriesService: CategoriesService) {}

  async onModuleInit() {
    const defaults = [
      // { name: 'films' },
      // { name: 'food' },
      // { name: 'cars' },
      // { name: 'colors' },
      // { name: 'books' },
      // { name: 'sports' },
      // { name: 'video-games' },
      // { name: 'tv-shows' },
      // { name: 'podcasts' },
      // { name: 'cities' },
      // { name: 'countries' },
      // { name: 'drinks' },
      // { name: 'coffees' },
      // { name: 'beers' },
      // { name: 'animals' },
      // { name: 'hobbies' },
      // { name: 'recipes' },
      // { name: 'artists' },
      // { name: 'songs' },
      // { name: 'board-games' },
      // { name: 'apps' },
      // { name: 'comics' },
      // { name: 'programming-langs' },
    ];

    // Récupère une seule fois la liste des catégories existantes
    const existing = await this.categoriesService.findAll();
    const existingNames = new Set(existing.map(c => c.name));

    for (const { name } of defaults) {
      if (!existingNames.has(name)) {
        await this.categoriesService.create({ name, lang: 'en' });
      }
    }
  }
}
