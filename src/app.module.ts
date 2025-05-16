// src/app.module.ts

import { Module, OnModuleInit }      from '@nestjs/common';

import { AuthModule }                from './auth/auth.module';
import { CategoriesModule }          from './categories/categories.module';
import { CategoriesService }         from './categories/categories.service';
import { Category }                  from './categories/category.entity';
import { ConfigModule }              from '@nestjs/config';
import { ItemsModule }               from './items/items.module';
import { ListsModule }               from './lists/lists.module';
import { LookupModule }              from './lookup/lookup.module';
import { ServeStaticModule }         from '@nestjs/serve-static';
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
  ],
  providers: [],
  // Pas besoin de providers ici, on utilisera CategoriesService
})
export class AppModule implements OnModuleInit {
  constructor(private readonly categoriesService: CategoriesService) {}

  async onModuleInit() {
    const defaults = [
      { name: 'films',            imageUrl: '/static/images/categories/films.png' },
      { name: 'food',             imageUrl: '/static/images/categories/food.png' },
      { name: 'cars',             imageUrl: '/static/images/categories/cars.png' },
      { name: 'colors',           imageUrl: '/static/images/categories/colors.png' },
      { name: 'music',            imageUrl: '/static/images/categories/music.png' },
      { name: 'books',            imageUrl: '/static/images/categories/books.png' },
      { name: 'sports',           imageUrl: '/static/images/categories/sports.png' },
      { name: 'video-games',      imageUrl: '/static/images/categories/video-games.png' },
      { name: 'tv-shows',         imageUrl: '/static/images/categories/tv-shows.png' },
      { name: 'podcasts',         imageUrl: '/static/images/categories/podcasts.png' },
      { name: 'travel',           imageUrl: '/static/images/categories/travel.png' },
      { name: 'cities',           imageUrl: '/static/images/categories/cities.png' },
      { name: 'countries',        imageUrl: '/static/images/categories/countries.png' },
      { name: 'drinks',           imageUrl: '/static/images/categories/drinks.png' },
      { name: 'coffees',          imageUrl: '/static/images/categories/coffees.png' },
      { name: 'beers',            imageUrl: '/static/images/categories/beers.png' },
      { name: 'animals',          imageUrl: '/static/images/categories/animals.png' },
      { name: 'hobbies',          imageUrl: '/static/images/categories/hobbies.png' },
      { name: 'recipes',          imageUrl: '/static/images/categories/recipes.png' },
      { name: 'artists',          imageUrl: '/static/images/categories/artists.png' },
      { name: 'songs',            imageUrl: '/static/images/categories/songs.png' },
      { name: 'quotes',           imageUrl: '/static/images/categories/quotes.png' },
      { name: 'fashion',          imageUrl: '/static/images/categories/fashion.png' },
      { name: 'gadgets',          imageUrl: '/static/images/categories/gadgets.png' },
      { name: 'tech',             imageUrl: '/static/images/categories/tech.png' },
      { name: 'board-games',      imageUrl: '/static/images/categories/board-games.png' },
      { name: 'apps',             imageUrl: '/static/images/categories/apps.png' },
      { name: 'movies-classics',  imageUrl: '/static/images/categories/movies-classics.png' },
      { name: 'comics',           imageUrl: '/static/images/categories/comics.png' },
      { name: 'programming-langs',imageUrl: '/static/images/categories/programming-langs.png' },
    ];

    // Récupère une seule fois la liste des catégories existantes
    const existing = await this.categoriesService.findAll();
    const existingNames = new Set(existing.map(c => c.name));

    for (const { name, imageUrl } of defaults) {
      if (!existingNames.has(name)) {
        await this.categoriesService.create({ name, imageUrl });
      }
    }
  }
}
