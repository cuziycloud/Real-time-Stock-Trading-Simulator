import { WebSocketGateway } from "@nestjs/websockets";

@WebSocketGateway({cors: true})
export class EventsGateway implements Onw {
    constructor(parameters) {
        
    }
}
