import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MeetingService } from 'src/app/services/meeting.service';
import { Location } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Cookie } from 'ng2-cookies';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-view-meeting',
  templateUrl: './view-meeting.component.html',
  styleUrls: ['./view-meeting.component.css'],
  providers: [Location]
})
export class ViewMeetingComponent implements OnInit {

  public meetingId: string;
  public userId: string;

  public participantName: string;
  public organizerName: string;

  public meetingName: string;
  public meetingDescription: string;
  public meetingStartDateAndTime: Date;
  public meetingEndDateAndTime: Date;
  public meetingLocation: string;

  public meetingDuration


  constructor(public route: ActivatedRoute, public router: Router, public socketService: SocketService, public meetingService: MeetingService, public toastr: ToastrService, private location: Location, private modal: NgbModal) { }

  ngOnInit(): void {
    this.meetingId = this.route.snapshot.paramMap.get('meetingId')
    if (Cookie.get('permissions') == 'Admin' || Cookie.get('permissions') == 'admin') {
      this.getMeetingById(this.meetingId)
    }
    else {
      this.toastr.warning('You are not Authorized to Access this page', 'Warning!')
      this.router.navigate(['/login'])
    }
  }


  public getMeetingById: any = (id) => {
    this.meetingService.getMeetingById(id).subscribe(
      (apiRes) => {
        if (apiRes.status == 200) {
          //console.log(apiRes)
          let meeting = apiRes.data
          this.participantName = meeting.participantName
          this.organizerName = meeting.organizerName
          this.meetingName = meeting.meetingName
          this.meetingDescription = meeting.meetingDescription
          this.meetingStartDateAndTime = meeting.meetingStartDateAndTime
          this.meetingEndDateAndTime = meeting.meetingEndDateAndTime
          this.meetingLocation = meeting.meetingLocation
          this.meetingDuration = ((new Date(meeting.meetingEndDateAndTime).getTime() - new Date(meeting.meetingStartDateAndTime).getTime()) / 1000 / 60 / 60).toFixed(2)
        }
        else if (apiRes.status == 404) {
          this.toastr.error('No Meeting Found', 'Error')
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

  open(content) {
    this.modal.open(content);
  }


  public deleteMeeting: any = () => {
    this.meetingService.deleteMeeting(this.meetingId).subscribe(
      (apiRes) => {
        //console.log(apiRes)
        if (apiRes.status == 200) {
          this.toastr.success('Meeting Cancelled Successfully', 'Success')
          let meetingData = apiRes.data
          let dataToNotify = {
            message: `Hi ${meetingData.participantName}, ${meetingData.organizerName} has Cancelled the Meeting - "${meetingData.meetingName}". Kindly check your Email/Calender Dashboard`,
            userId: meetingData.participantId
          }
          this.userId = meetingData.participantId
          this.notifyUpdatesToParticipant(dataToNotify);
          setTimeout(() => {
            this.router.navigate(["/meeting-home", this.userId])
          }, 2000)
        }
        else if (apiRes.status == 404) {
          this.toastr.error('No Meeting Found', 'Error')
        }
        else if (apiRes.status == 500) {
          this.toastr.error(apiRes.message, 'Error')
          this.router.navigate(['/server-error'])
        }
      },
      (error) => {
        console.log(error)
        console.log("Some error occured while deleting the Meeting")
        console.log(error.errorMessage)
        this.toastr.error(error.errorMessage, 'Error')
      }
    )
  }
  public goBack() {
    this.location.back();
  }

  public notifyUpdatesToParticipant: any = (data) => {
    //console.log(data)
    this.socketService.notifyUpdates(data);
  }
}
