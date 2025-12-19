import { Injectable } from '@nestjs/common';

@Injectable()
export class MarketService {
  private stocks = [
    { symbol: 'VIC', price: 19.5 },
    { symbol: 'FPT', price: 70.0 },
    { symbol: 'MWG', price: 45.0 },
    { symbol: 'PNJ', price: 35.2 },
    { symbol: 'VNM', price: 55.9 },
    { symbol: 'PHS', price: 80.5 },
  ];

  getCurrentPrices() {
    return this.stocks;
  }

  updateMarketPrices() {
    this.stocks = this.stocks.map((s) => {
      const change = Math.random() * 1 - 1;

      let newPrice = s.price + change;
      if (newPrice < 1) newPrice = 1;

      return {
        ...s,
        price: Number(newPrice.toFixed(2)),
      };
    });

    return this.stocks;
  }
}
