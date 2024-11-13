import { IncomingMessage } from 'http';
import {WebSocket, WebSocketServer, ServerOptions, RawData} from 'ws'
import { UserManager } from './usermanager';
import {WsMessage} from '@websocket/types'


export class WsHandler {
    private wsServer: WebSocketServer;
    private userManager: UserManager;

    initialize(options: ServerOptions) {
        this.wsServer = new WebSocketServer(options);
        this.userManager = new UserManager();

        this.wsServer.on('listening',() => {console.log(`Server listening on port ${options.port}`)});
        this.wsServer.on('connection', (socket, request) => this.onSocketConnected(socket,request));        
    }
    
    private onSocketConnected(socket: WebSocket, request: IncomingMessage) {
        console.log("New socket connected");
        this.userManager.add(socket, request);
        
        socket.on('message', (data) => this.onSocketMessage(socket, data))
        socket.on('close', (code, reason) => this.onSocketClosed(socket, code, reason))
    }

    private onSocketMessage(socket: WebSocket, data: RawData) {
        const payload: WsMessage = JSON.parse(`${data}`);
        console.log("Received payload: ", payload);

        switch (payload.event) {
            case 'chat': {
                this.userManager.relayChat(socket,payload);
                break;
            }
        }        
    }

    private onSocketClosed(socket: WebSocket, code: number, reason: Buffer) {
        console.log(`Client has disconnected: code=${code}, reson=${reason}`)
        this.userManager.remove(socket);
    }
}