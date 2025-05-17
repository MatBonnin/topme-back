// src/i18n/i18n.module.ts

import { I18nController } from './i18n.controller';
import { Module }          from '@nestjs/common';

@Module({
  controllers: [I18nController],
})
export class I18nModule {}
