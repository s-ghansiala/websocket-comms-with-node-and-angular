import { Injectable } from "@angular/core";
import { ChatRelayMessage, SystemNotice, User, WsMessage } from "@websocket/types";
import { BehaviorSubject, Subject } from "rxjs";
import {WebSocketSubject, webSocket} from 'rxjs/webSocket'

@Injectable()

export class AppService {
    socket: WebSocketSubject<WsMessage>;
    user$ = new BehaviorSubject<User>(undefined);
    chatMessage$ = new Subject<ChatRelayMessage>();
    systemNotice$ = new Subject<SystemNotice>();
    userList$ = new BehaviorSubject<User[]>([])

    connect(name: string) {
        this.socket = webSocket(`ws://localhost:8080/?name=${name}`);
        this.socket.subscribe(message => this.onMessageFromServer(message));
    }

    send(message: string) {
        const chatMsg: WsMessage = {
            event: 'chat',
            contents: message
        }
        this.socket.next(chatMsg);
    }

    private onMessageFromServer(message: WsMessage) {
        console.log("From server: ", message);
        switch (message.event) {
            case 'login': {
                this.user$.next(message.user)
                break;
            }
            case 'chatRelay': {
                this.chatMessage$.next(message)
                break;
            }
            case 'systemNotice': {
                this.systemNotice$.next(message)
                break;
            }
            case 'userList': {
                this.userList$.next(message.users)
                break;
            } 
        }
    }
}