import { OnGatewayConnection, WebSocketGateway } from "@nestjs/websockets";

@WebSocketGateway({cors: true})
export class EventsGateway implements OnGatewayConnection {
    constructor(parameters) {
        
    }
}
