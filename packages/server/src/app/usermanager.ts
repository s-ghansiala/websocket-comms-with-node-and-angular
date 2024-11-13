import { WebSocket } from "ws";
import {WsMessage, User, LoginMessage, ChatRelayMessage, ChatMessage, UserListMessage} from '@websocket/types'
import { IncomingMessage } from "http";

let currId = 1;

export class UserManager {
    private sockets = new Map<WebSocket, User>();

    add(socket: WebSocket, request: IncomingMessage) {
        // localhost:8080/?name=Sandeep
        const fullURL = new URL(request.headers.host + request.url);
        const name = fullURL.searchParams.get('name');
        const user: User = {
            name,
            id: currId++
        }
        const systemNotice: WsMessage = {
            event: 'systemNotice',
            contents: `${name} has joined the chat`
        }

        const loginMessage: LoginMessage = {
            event: 'login',
            user: user
        }

        socket.send(JSON.stringify(loginMessage));

        this.sendtoAll(systemNotice);

        this.sockets.set(socket,user);

        this.sendUserListToAll();
    }

    remove(socket: WebSocket) {
        const name = this.sockets.get(socket).name;
        this.sockets.delete(socket);

        const logoutMessage: WsMessage = {
            event: 'systemNotice',
            contents: `${name} has left the chat`
        }

        this.sendtoAll(logoutMessage);

        this.sendUserListToAll();
    }

    send(socket: WebSocket, message: WsMessage) {
        const data = JSON.stringify(message);
        socket.send(data);
    }

    sendtoAll(message: WsMessage) {
        const data  = JSON.stringify(message);

        Array.from(this.sockets.keys()).forEach(socket => {
            if(socket.readyState === WebSocket.OPEN) {
                socket.send(data);
            }
        })
    }

    relayChat(from: WebSocket, message: ChatMessage) {
        const relayMessage: ChatRelayMessage = {
            event: "chatRelay",
            contents: message.contents,
            author: this.sockets.get(from)
        }
        this.sendtoAll(relayMessage);
    }

    sendUserListToAll() {
        const userList: UserListMessage = {
            event: 'userList',
            users: Array.from(this.sockets.values())
        }

        this.sendtoAll(userList);
    }
}