import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MarketService } from 'src/market/market.service';
import { OrdersService } from 'src/orders/orders.service';

@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private ordersService: OrdersService,
    private marketService: MarketService,
  ) {}

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
    }, 10000);
  }

  async handleMarketFluctuation() {
    const newStocks = this.marketService.updateMarketPrices();
    //const marketData: StockPriceDto[] = this.stocks;

    this.server.emit('market-update', newStocks); // Gửi giá mới cho FE
    // Matching Engine
    try {
      const matchOrders = await this.ordersService.matchOrders(newStocks);
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
