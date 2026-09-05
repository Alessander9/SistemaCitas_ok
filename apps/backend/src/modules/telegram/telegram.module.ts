import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { TelegramBotProvider } from './providers/telegram-bot.provider';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TelegramController],
  providers: [TelegramService, TelegramBotProvider],
  exports: [TelegramService],
})
export class TelegramModule {}
