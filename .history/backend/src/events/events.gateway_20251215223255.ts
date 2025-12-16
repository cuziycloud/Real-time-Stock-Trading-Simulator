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
    { symbol: 'VIC', price: 43.5 },
    { symbol: 'FPT', price: 98.0 },
    { symbol: 'MWG', price: 45.0 },
  ];

  afterInit(server: Server) {
    console.log('Socket Gateway khởi động');

    setInterval(() => {
        this.handleMarketFluctuation();
    }, 2000);
  }

  handleMarketFluctuation() {
    this.stocks = this.stocks.map(s => {
        const change = (Math.random() *1 - 0.5);
        return {
            ...s,
            price: Number((s.price + change).)
        }
    })
  }
}
