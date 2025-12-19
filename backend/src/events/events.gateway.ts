import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `user-${userId}`;
    await client.join(roomName);
    console.log(`User ${userId} đã vào phòng: ${roomName}`);
    //console.log(`Client ${client.id} đã vào phòng: ${roomName}`);
  }
  afterInit(server: Server) {
    console.log('Socket Gateway khởi động');

    setInterval(() => {
      void this.handleMarketFluctuation();
    }, 5000);
  }

  async handleMarketFluctuation() {
    // duyet qua tung ma, tang/giam ngau nhien
    this.stocks = this.stocks.map((s) => {
      const change = Math.random() * 1 - 0.5; //rd từ -0.5 => 0.5
      return {
        ...s,
        price: Number((s.price + change).toFixed(2)), // tron 2 so le
      };
    });
    //const marketData: StockPriceDto[] = this.stocks;

    this.server.emit('market-update', this.stocks);
    try {
      const matchOrders = await this.ordersService.matchOrders(this.stocks);
      if (matchOrders.length > 0) {
        matchOrders.forEach((order) => {
          const roomName = `user-${order.user.id}`;

          this.server.to(roomName).emit('order-matched', {
            id: order.id,
            symbol: order.symbol,
            direction: order.direction,
            quantity: order.quantity,
            price: Number(order.targetPrice),
            message: `Lệnh ${order.direction} ${order.symbol} đã khớp`,
          });
          console.log(`--> Đã gửi thông báo tới phòng ${roomName}`);
        });
      }
    } catch (error) {
      console.error('Lỗi Matching:', error);
    }
  }
}
