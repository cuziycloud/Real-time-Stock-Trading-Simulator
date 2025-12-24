import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { StocksModule } from 'src/stocks/stocks.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule, StocksModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [],
})
export class AiModule {}
