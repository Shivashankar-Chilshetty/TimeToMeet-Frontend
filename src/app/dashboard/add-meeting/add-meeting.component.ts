import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MeetingService } from 'src/app/services/meeting.service';
import { Cookie } from 'ng2-cookies';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from 'src/app/services/socket.service';


@Component({
  selector: 'app-add-meeting',
  templateUrl: './add-meeting.component.html',
  styleUrls: ['./add-meeting.component.css']
})
export class AddMeetingComponent implements OnInit {

  public participantId: string;
  public userId: string;

  public organizerId: string;
  public organizerName: string;

  public meetingName: string;
  public meetingDescription: string;
  public startDateAndTime: Date;
  public endDateAndTime: Date;
  public meetingLocation: string;


  constructor(public meetingServices: MeetingService, public socketService: SocketService, private route: ActivatedRoute, public router: Router, public toastr: ToastrService) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId')
    this.participantId = this.userId
    //console.log(this.participantId)
    this.organizerId = Cookie.get('userId')
    this.organizerName = Cookie.get('firstName')
  }

  public validateStartAndEndDate(startDate: any, endDate: any): boolean {//method to validate the the start and end date of meeting .
    let start = new Date(startDate);
    let end = new Date(endDate);
    if (end < start) {
      return true;
    }
    else {
      return false;
    }
  }


  public validateStartOrEndDate(startDate: any): boolean {//method to validate the current date and date of meeting .
    let start = new Date(startDate);
    let end: any = new Date();
    if (end > start) {
      return true;
    }
    else {
      return false;
    }
  }

  public addMeetingFunction: any = () => {
    let meetingDetails = {
      meetingName: this.meetingName,
      meetingDescription: this.meetingDescription,
      organizerId: this.organizerId,
      organizerName: this.organizerName,
      participantId: this.participantId,
      meetingStartDateAndTime: this.startDateAndTime.getTime(),
      meetingEndDateAndTime: this.endDateAndTime.getTime(),
      meetingLocation: this.meetingLocation
    }
    //console.log(meetingDetails)
    this.meetingServices.addMeeting(meetingDetails).subscribe(
      (apiRes) => {
        //console.log(apiRes)
        if (apiRes.status === 200) {
          let meetingData = apiRes.data
          //console.log(meetingData)
          this.toastr.success('Meeting Scheduled Successfully', 'Success')
          let dataToNotify = {
            message: `Hi ${meetingData.participantName}, ${meetingData.organizerName} has Scheduled a Meeting With You. Kindly check your Email/Calender Dashboard`,
            userId: meetingData.participantId
          }
          this.notifyUpdatesToParticipant(dataToNotify);
          setTimeout(() => {
            this.router.navigate(['/meeting-home', this.userId]);
          }, 1000);//redirecting to meeting-home page

        }
        else if (apiRes.status == 404) {
          this.toastr.error(apiRes.message, "Error!");
        }
      },
      (error) => {
        if (error.status == 500) {
          this.toastr.error('Failed to Schedule a meeting', 'Error!')
          this.router.navigate(['/server-error'])
        }
        else {
          this.toastr.error('Some Error Occured', 'Error!')
        }

      }
    )

  }

  public notifyUpdatesToParticipant: any = (data) => {
    //console.log(data)
    this.socketService.notifyUpdates(data);
  }
}
