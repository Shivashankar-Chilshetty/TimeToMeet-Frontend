import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

import { Observable, Observer } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  //private url = 'http://api.shivashankarchillshetty.com';
  private url = 'http://localhost:3000'
  private socket;

  constructor(public http: HttpClient) {
    this.socket = io(this.url);
  }



  //events to be listened
  //listen event 1
  public verifyUser = () => {
    return new Observable((observer) => {
      this.socket.on('verifyUser', (data) => {
        observer.next(data)
      }); //end Socket
    }); //end Observable
  }// end verifyUser


  //listen event 2
  public authError = () => {
    return new Observable((observer) => {
      this.socket.on('auth-error', (data) => {
        observer.next(data);
      }); // end Socket
    }); // end Observable
  } // end authError


  //listen event 3
  public getUpdatesFromAdmin = (userId) => {
    return Observable.create((observer) => {
      this.socket.on(userId, (data) => {
        observer.next(data);
      }); // end Socket
    }); // end Observable
  } // end getUpdatesFromOthers



  //events to be emitted
  //emit event 1
  public setUser = (authToken) => {
    this.socket.emit('set-user', authToken)
  }

  //emit event 3
  public notifyUpdates = (data) => {
    this.socket.emit('notify-updates', data);
  }

  public exitSocket = () => {
    this.socket.disconnect();
  }


  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof Error) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    return Observable.throw(errorMessage);
  }  // END handleError

}
