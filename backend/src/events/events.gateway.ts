import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { StockPriceDto } from 'src/orders/dto/market-update.dto';
import { OrdersService } from 'src/orders/orders.service';

@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private stocks = [
    { symbol: 'VIC', price: 19.5 },
    { symbol: 'FPT', price: 70.0 },
    { symbol: 'MWG', price: 45.0 },
    { symbol: 'PNJ', price: 35.2 },
    { symbol: 'VNM', price: 55.9 },
    { symbol: 'PHS', price: 80.5 },
  ];

  constructor(private ordersService: OrdersService) {}
  afterInit(server: Server) {
    console.log('Socket Gateway khởi động');

    setInterval(() => {
      this.handleMarketFluctuation();
    }, 5000);
  }

  handleMarketFluctuation() {
    // duyet qua tung ma, tang/giam ngau nhien
    this.stocks = this.stocks.map((s) => {
      const change = Math.random() * 1 - 0.5; //rd từ -0.5 => 0.5
      return {
        ...s,
        price: Number((s.price + change).toFixed(2)), // tron 2 so le
      };
    });
    const marketData: StockPriceDto[] = this.stocks;

    this.server.emit('market-update', marketData);
    this.ordersService.matchOrders(this.stocks).catch((err) => {
      console.error('Lỗi Matching Engine:', err);
    });
    console.log('Da gui gia moi:', marketData);
  }
}
