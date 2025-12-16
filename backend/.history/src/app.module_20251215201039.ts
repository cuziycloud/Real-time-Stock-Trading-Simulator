import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StocksModule } from './stocks/stocks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      port: 3306,
      host: 'localhost',
      username: 'root',
      password: '',
      database: 'stock_db',
      entities: [__dirname + '/**/*.entity{.ts, .js}'], //tu dong tim bang
      synchronize: true, 
    }),
    StocksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
