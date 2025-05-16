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
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  async onModuleInit() {
    const defaults = [
      { name: 'films',  imageUrl: '/static/images/categories/films.png' },
      { name: 'food',   imageUrl: '/static/images/categories/food.png'  },
      { name: 'cars',   imageUrl: '/static/images/categories/cars.png'  },
      { name: 'colors', imageUrl: '/static/images/categories/colors.png'},
    ];

    for (const { name, imageUrl } of defaults) {
      // catégorie existante ou création via service
      const exists = await this.categoriesService.findAll()
        .then(list => list.find(c => c.name === name));

      if (!exists) {
        await this.categoriesService.create({ name, imageUrl });
      }
    }
  }
}
