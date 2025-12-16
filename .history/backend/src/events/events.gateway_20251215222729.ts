import { OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "";

@WebSocketGateway({cors: true})
export class EventsGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server;

}
