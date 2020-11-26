import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { Subject } from 'rxjs';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MeetingService } from 'src/app/services/meeting.service';

import { Location } from '@angular/common';

interface myCalEvent extends CalendarEvent {
  snoozeStatus: boolean;
  firstPopUp: boolean;
  description: string;
  address: string;
  meetingId: string;
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
  selector: 'app-meeting-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './meeting-home.component.html',
  styleUrls: ['./meeting-home.component.css']
})
export class MeetingHomeComponent implements OnInit {
  public participantId: string;
  public userId: string;
  public organizerId: string;
  public organizerName: string;
  public meetingName: string;
  public meetingDescription: string;
  public startDateAndTime: Date;
  public endDateAndTime: Date;
  public meetingLocation: string;

  public events: myCalEvent[] = [];
  public meetings = [];
  public flag: boolean = false;
  public openMeetingAlertModal: boolean = true;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();
  //popup all meetins of today
  activeDayIsOpen: boolean = true;
  modalData: {
    action: string;
    event: CalendarEvent;
  };


  refresh: Subject<any> = new Subject();

  constructor(private location: Location, public meetingServices: MeetingService, public toastr: ToastrService, public router: Router, private route: ActivatedRoute, private modal: NgbModal) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId')
    this.participantId = this.userId
    //console.log(this.participantId)
    this.getAllMeetingsByParticipantId(this.participantId)
  }


  //below function is to pop-up current cell's meeting names on clicked 
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
    let meetingId = event.meetingId
    this.router.navigate(['/view-meeting', meetingId])
  }

  public goBack() {
    this.router.navigate(['/adminPage'])
    //this.location.back();
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }


  public getAllMeetingsByParticipantId: any = (participantId) => {
    this.meetingServices.getAllMeetingsByParticipantId(participantId).subscribe(
      (apiRes) => {
        //console.log(apiRes)
        this.events = []
        this.flag = true;
        if (apiRes.status == 200) {
          this.meetings = apiRes.data
          for (let [i, m] of this.meetings.entries()) {
            //console.log(`${i}`)
            let temp = {
              meetingId: m.meetingId,
              title: m.meetingName,
              description: m.meetingDescription,
              start: new Date(m.meetingStartDateAndTime),
              end: new Date(m.meetingEndDateAndTime),
              address: m.meetingLocation,
              color: colors[Object.keys(colors)[`${i}`]],
              snoozeStatus: true,
              firstPopUp: true
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
          this.refresh.next()
          this.events = []
          this.flag = true

          this.toastr.info('You do not have any meetings scheduled yet!', 'Info')
        }
        else if (apiRes.status == 500) {
          this.flag = false
          this.toastr.error(apiRes.message, 'Error!')
          this.router.navigate(['/server-error'])
        }

      },
      (error) => {
        this.flag = false
        console.log(error)
        this.toastr.error('Some Error Occured', 'Error!');
      }
    )
  }

}

