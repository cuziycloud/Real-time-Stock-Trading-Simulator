import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StocksModule } from './stocks/stocks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type:
    }),
    StocksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
