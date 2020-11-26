import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies';
import { ToastrService } from 'ngx-toastr';
import { MeetingService } from 'src/app/services/meeting.service';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-edit-meeting',
  templateUrl: './edit-meeting.component.html',
  styleUrls: ['./edit-meeting.component.css']
})
export class EditMeetingComponent implements OnInit {

  public meetingId: string;
  public userId: string;
  public organizerName: string;

  public currentMeeting: any;

  constructor(public route: ActivatedRoute, public router: Router, public socketService: SocketService, public meetingService: MeetingService, public toastr: ToastrService) { }

  ngOnInit(): void {
    this.meetingId = this.route.snapshot.paramMap.get('meetingId')
    //console.log(this.meetingId)
    if (Cookie.get('permissions') == 'Admin' || Cookie.get('permissions') == 'admin') {
      this.getMeetingById(this.meetingId)
    }
    else {
      this.toastr.warning('You are not Authorized to Access this page', 'Warning!')
      this.router.navigate(['/login'])
    }


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

  public getMeetingById: any = (id) => {
    this.meetingService.getMeetingById(id).subscribe(
      (apiRes) => {
        if (apiRes.status == 200) {
          //console.log(apiRes)
          this.currentMeeting = apiRes.data
          this.organizerName = this.currentMeeting.organizerName
          this.userId = this.currentMeeting.participantId
          //console.log(this.currentMeeting.meetingName)
        }
        else if (apiRes.status == 404) {
          this.toastr.error('No Meetings Found', 'Error')
        }
        else if (apiRes.status == 500) {
          this.toastr.error(apiRes.message, 'Error')
          this.router.navigate(['/server-error'])
        }

      },
      (error) => {
        console.log(error)
        console.log("Some error occured in finding Meeting details")
        console.log(error.errorMessage)
        this.toastr.error(error.errorMessage, 'Error')
      }
    )
  }


  public editMeetingFunction: any = () => {
    this.meetingService.editMeeting(this.currentMeeting.meetingId, this.currentMeeting).subscribe(
      (apiRes) => {
        if (apiRes.status == 200) {
          //console.log(apiRes)
          let meetingData = apiRes.data
          this.toastr.success('Meeting Edited Successfully!', "Success")
          let dataToNotify = {
            message: `Hi ${meetingData.participantName}, ${meetingData.organizerName} has Updated the Meeting-'${meetingData.meetingName}'. Kindly check your Email/Calender Dashboard`,
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
        else if (apiRes.status == 500) {
          this.toastr.error(apiRes.message, 'Error')
          this.router.navigate(['/server-error'])
        }
      },
      (error) => {
        console.log(error)
        console.log("Some error occured in Editing Meeting details")
        console.log(error.errorMessage)
        this.toastr.error(error.errorMessage, 'Error')
      }
    )

  }

  public notifyUpdatesToParticipant: any = (data) => {
    //console.log(data)
    this.socketService.notifyUpdates(data);
  }
}
