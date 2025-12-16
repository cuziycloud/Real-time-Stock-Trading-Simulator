import { OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

@WebSocketGateway({cors: true})
export class EventsGateway implements OnGatewayInit {
    @WebSocketServer
    
}
