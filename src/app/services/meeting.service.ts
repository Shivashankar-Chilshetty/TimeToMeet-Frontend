import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Cookie } from 'ng2-cookies';



@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  //private url = 'http://api.shivashankarchillshetty.com';
  private url = 'http://localhost:3000'

  constructor(private http: HttpClient) { }

  public addMeeting(meetingDetails): Observable<any> {
    const params = new HttpParams()
      .set('meetingName', meetingDetails.meetingName)
      .set('meetingDescription', meetingDetails.meetingDescription)
      .set('organizerId', meetingDetails.organizerId)
      .set('organizerName', meetingDetails.organizerName)
      .set('participantId', meetingDetails.participantId)
      .set('meetingStartDateAndTime', meetingDetails.meetingStartDateAndTime)
      .set('meetingEndDateAndTime', meetingDetails.meetingEndDateAndTime)
      .set('meetingLocation', meetingDetails.meetingLocation)
      .set('authToken', Cookie.get('authToken'))
    return this.http.post(`${this.url}/api/v1/meetings/addMeeting`, params);

  }

  public getAllMeetingsByParticipantId(participantId): Observable<any> {
    let token = Cookie.get('authToken')
    return this.http.get(`${this.url}/api/v1/meetings/viewAllMeetings/` + participantId + '/query?authToken=' + token);
  }

  public editMeeting(meetingId, newMeetingDetails): Observable<any> {
    let token = Cookie.get('authToken')
    return this.http.put(`${this.url}/api/v1/meetings/editMeeting/` + meetingId + '/query?authToken=' + token, newMeetingDetails)
  }

  public deleteMeeting(meetingId): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
    return this.http.post(`${this.url}/api/v1/meetings/deleteMeeting/` + meetingId, params)
  }

  public getMeetingById(meetingId): Observable<any> {
    let token = Cookie.get('authToken')
    return this.http.get(`${this.url}/api/v1/meetings/getMeetingById/` + meetingId + '/query?authToken=' + token)
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
