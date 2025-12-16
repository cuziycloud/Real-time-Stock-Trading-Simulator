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

  afterInit(server: Server) {
    console.log('Socket Gateway khởi động');
  }

  private stocks = [
    { symbol: 'VIC', price: 43.5 },
    { symbol: 'FPT', price: 98.0 },
    { symbol: 'MWG', price: 45.0 },
  ];
  
}
