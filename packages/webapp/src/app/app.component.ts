import { Component, OnInit } from '@angular/core';
import {ChatRelayMessage, SystemNotice, User} from '@websocket/types'
import { AppService } from './app.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'websocket-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{

  constructor(private service: AppService, private snackbar: MatSnackBar){}

  title = 'Angular Frontend';

  currentUser: User;
  messages: ChatRelayMessage[] = [];
  users: User[] = [];

  ngOnInit() {
    this.service.user$.subscribe(user => this.currentUser = user)
    this.service.chatMessage$.subscribe(message => this.messages = [...this.messages, message]);
    this.service.systemNotice$.subscribe(notice => this.onSystemNotice(notice));
    this.service.userList$.subscribe(list => this.users = list);
  }

  connect(userName: HTMLInputElement) {
    this.service.connect(userName.value);
  }

  send(userInput: HTMLInputElement) {
    this.service.send(userInput.value);
    userInput.value ='';
  }

  onSystemNotice(notice:SystemNotice) {
    // alert(notice.contents);
    this.snackbar.open(notice.contents, undefined, {duration: 1000})
  }
}


