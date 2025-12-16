import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private stocks = [
    { symbol: 'VIC', price: 43.5, companyName: 'Vingroup' },
    { symbol: 'FPT', price: 98.0, companyName: 'Vingroup' },
    { symbol: 'MWG', price: 45.0 },
  ];

  afterInit(server: Server) {
    console.log('Socket Gateway khởi động');

    setInterval(() => {
      this.handleMarketFluctuation();
    }, 2000);
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
    this.server.emit('market-update', this.stocks);
    console.log('Da gui gia moi:', this.stocks);
  }
}
