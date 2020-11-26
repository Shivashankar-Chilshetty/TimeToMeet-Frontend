import { ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies';
import { MeetingService } from 'src/app/services/meeting.service';

import { isSameDay, isSameMonth } from 'date-fns';
import { Subject } from 'rxjs';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/services/user.service';
import { SocketService } from 'src/app/services/socket.service';

interface myCalEvent extends CalendarEvent {
  snoozeStatus: boolean;
  description: string;
  address: string;
  meetingId: string;
  organizerName: string
  firstPopUp: boolean;
}

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
  green: {
    primary: '#219513',
    secondary: '#70F661',
  },
  black: {
    primary: '#040404',
    secondary: '#5B655A',
  },
  orange: {
    primary: '#FF9002',
    secondary: '#FCCC05',
  }
};

@Component({
  selector: 'app-normal-user-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './normal-user-page.component.html',
  styleUrls: ['./normal-user-page.component.css']
})
export class NormalUserPageComponent implements OnInit {

  @ViewChild('meetingAlert') meetingAlert: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();


  //popup all meetins of today
  activeDayIsOpen: boolean = true;

  modalData: {
    event: myCalEvent;
  };

  public events: myCalEvent[] = [];
  public userId: string;
  public authToken: string;
  public participantId: string;
  public organizerId: string;
  public organizerName: string;
  public meetingName: string;
  public meetingDescription: string;
  public startDateAndTime: Date;
  public endDateAndTime: Date;
  public meetingLocation: string;
  public meetings = [];


  public flag: boolean = false;
  public name: string

  public openMeetingAlertModal: boolean = true;

  refresh: Subject<any> = new Subject();

  @ViewChild('meetingInfo', { static: true }) meetingInfo: TemplateRef<any>;



  constructor(public userService: UserService, public meetingService: MeetingService, public socketService: SocketService, public router: Router, public toastr: ToastrService, public modal: NgbModal) { }

  ngOnInit(): void {
    if (Cookie.get('permissions') == 'user') {
      this.userId = Cookie.get('userId')
      this.name = Cookie.get('firstName') + ' ' + Cookie.get('lastName')
      this.authToken = Cookie.get('authToken')
      this.checkStatus()
      this.verifyUserConfirmation()
      this.authError()
      this.getUpdatesFromAdmin()
      this.getMeetingInfoForNormalUser(this.userId)
      setInterval(() => {
        this.reminderForMeeting();
      }, 1000);
    }
    else {
      this.toastr.warning('You are not Authorized to Access this page', 'Warning!')
      this.router.navigate(['/login'])
    }

  }

  public checkStatus: any = () => {
    if (Cookie.get('authToken') === undefined || Cookie.get('authToken') === '' || Cookie.get('authToken') === null) {
      this.router.navigate(['/'])
      return false;
    }
    else {
      return true
    }
  }
  public verifyUserConfirmation: any = () => {
    this.socketService.verifyUser().subscribe((data) => {
      this.socketService.setUser(this.authToken)
    })
  }
  public authError: any = () => {
    this.socketService.authError()
      .subscribe((data) => {
        this.toastr.info("Authorization Key is missing/incorrect", "Please login again");
        this.router.navigate(['/login']);
      });
  }//end authErrorFunction


  public snooze(modalData) {
    //console.log('snoozing', modalData.event.title)
    let currentTime = new Date().getTime();
    if (!modalData.event.firstPopUp) {
      if (isSameDay(new Date(), modalData.event.start) && new Date(modalData.event.start).getTime() - currentTime <= 60000 && new Date(modalData.event.start).getTime() > currentTime) {
        if (this.openMeetingAlertModal && modalData.event.snoozeStatus) {
          //if clicked on snooze button, then open modal after 5 seconds
          setTimeout(() => {
            if (this.openMeetingAlertModal) {
              this.modal.open(this.meetingAlert, { size: 'md' });
              this.openMeetingAlertModal = false;
            }
          }, 5000)


        }
      }
      else if (currentTime > new Date(modalData.event.start).getTime() && currentTime < new Date(modalData.event.end).getTime()) {
        modalData.event.snoozeStatus = false
        //this.openMeetingAlertModal = true;
        this.toastr.info(`Your Meeting '${modalData.event.title}' is in Progress!`, 'Meeting Reminder!')
      }
    }

  }
  public dismissFunction(modalData) {
    //console.log('dismissing', modalData.event.title)
    let currentTime = new Date().getTime();
    modalData.event.snoozeStatus = false;
    let time = new Date(modalData.event.start).getTime() - currentTime //getting the time difference to display Meeting remainder toastr 
    setTimeout(() => {
      this.toastr.info(`Your Meeting '${modalData.event.title}' is in Progress!`, 'Meeting Reminder!')
    }, time)
  }

  public reminderForMeeting: any = () => {
    let currentTime = new Date().getTime();
    for (let e of this.events) {
      //check if any meeting starts on the current day(i,e today) & if meeting start time is less then 1 minutes & start time is greater then current time, then open a model for snooze/close
      if (isSameDay(new Date(), e.start) && new Date(e.start).getTime() - currentTime <= 60000 && new Date(e.start).getTime() > currentTime) {
        if (e.firstPopUp) {
          if (e.snoozeStatus && this.openMeetingAlertModal) {
            e.firstPopUp = false;
            this.modalData = { event: e }
            this.modal.open(this.meetingAlert, { size: 'md' });
            this.openMeetingAlertModal = false;
            break;
          }
        }
      }
    }
  }

  dayClicked({ date, events }: { date: Date; events: myCalEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  handleEvent(event): void {
    this.modalData = { event };
    this.modal.open(this.meetingInfo, { size: 'lg' });
  }

  public getMeetingInfoForNormalUser: any = (userId) => {
    this.events = []
    this.meetingService.getAllMeetingsByParticipantId(userId).subscribe(
      (apiRes) => {
        //console.log(apiRes)
        this.flag = true;
        if (apiRes.status == 200) {
          this.meetings = apiRes.data
          for (let [i, m] of this.meetings.entries()) {
            let temp = {
              meetingId: m.meetingId,
              title: m.meetingName,
              description: m.meetingDescription,
              start: new Date(m.meetingStartDateAndTime),
              end: new Date(m.meetingEndDateAndTime),
              address: m.meetingLocation,
              color: colors[Object.keys(colors)[`${i}`]],
              snoozeStatus: true,
              organizerName: m.organizerName,
              firstPopUp: true,
              duration: ((new Date(m.meetingEndDateAndTime).getTime() - new Date(m.meetingStartDateAndTime).getTime()) / 1000 / 60 / 60).toFixed(2)
            }
            this.events.push(temp)
          }
          //console.log(this.events)
          this.refresh.next();

          if (this.events.length == 0) {
            this.activeDayIsOpen = false;
            this.toastr.info('You do not have any meetings scheduled yet!', 'Info')
          }
        }
        else if (apiRes.status == 404) {
          this.flag = true
          this.activeDayIsOpen = false;
          this.events = []
          this.refresh.next();
          this.toastr.info('You do not have any meetings scheduled yet!', 'Info')
        }
        else if (apiRes.status == 500) {
          this.flag = true
          this.refresh.next();
          this.toastr.error(apiRes.message, 'Error!')
          this.router.navigate(['/server-error'])
        }

      },
      (error) => {
        this.flag = true
        console.log(error)
        this.toastr.error('Some Error Occured', 'Error!');
      }
    )
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  public logout(): any {
    this.userService.logout().subscribe(
      data => {
        //console.log(data)
        if (data.status == 200) {
          Cookie.delete('authToken')
          Cookie.delete('email')
          Cookie.delete('firstName')
          Cookie.delete('lastName')
          Cookie.delete('userId')
          this.socketService.exitSocket()
          this.toastr.success('Logout Successful', 'Success')
          this.router.navigate(['/login'])
        }
        else if (data.status == 404) {
          this.toastr.error(data.message)
          this.router.navigate(['/'])
        }
      },
      error => {
        console.log(error)
        this.toastr.error('some error')
      }
    )
  }

  public getUpdatesFromAdmin: any = () => {
    this.socketService.getUpdatesFromAdmin(this.userId).subscribe((data) => {
      this.getMeetingInfoForNormalUser(this.userId)
      this.toastr.info('Meeting Updated!', data.message)
    })
  }

}
