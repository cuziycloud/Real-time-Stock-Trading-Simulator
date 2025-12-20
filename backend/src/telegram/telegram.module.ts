import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { UsersModule } from 'src/users/users.module';
import { TelegramService } from './telegram.service';

@Module({
  imports: [
    UsersModule,
    TelegrafModule.forRoot({
      token: '8552595700:AAHKOLwl85abHfmxbZmaqWW8zy9E6rhnICI',
    }),
  ],
  providers: [TelegramService],
})
export class TelegramModule {}
