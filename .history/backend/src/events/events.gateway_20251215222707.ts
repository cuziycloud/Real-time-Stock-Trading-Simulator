import { OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "node_modules/mysql2/typings/mysql/lib/Server";

@WebSocketGateway({cors: true})
export class EventsGateway implements OnGatewayInit {
    @WebSocketServer()
    server:Server;
    
}
