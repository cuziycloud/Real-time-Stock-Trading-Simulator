import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StocksModule } from './stocks/stocks.module';
import { TypeOrmModule } from '@nestjs/typeorm';

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
      synchronize: true, //Tu dong tao bang khi chay code
    }),
    StocksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
