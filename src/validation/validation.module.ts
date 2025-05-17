// src/validation/validation.module.ts

import { Module }                from '@nestjs/common';
import { TranslateModule } from 'src/translate/translate.module';
import { TypeOrmModule }         from '@nestjs/typeorm';
import { Validation }            from './validation.entity';
import { ValidationController }  from './validation.controller';
import { ValidationService }     from './validation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Validation]),TranslateModule    // ← ajoute cette ligne
  ],
  providers: [ValidationService],
  controllers: [ValidationController],
  exports: [ValidationService],
})
export class ValidationModule {}
