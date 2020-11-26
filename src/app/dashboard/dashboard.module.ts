import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { NormalUserPageComponent } from './normal-user-page/normal-user-page.component';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';
import { MeetingHomeComponent } from './meeting-home/meeting-home.component';


import { FlatpickrModule } from 'angularx-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AddMeetingComponent } from './add-meeting/add-meeting.component';
import { EditMeetingComponent } from './edit-meeting/edit-meeting.component';
import { ViewMeetingComponent } from './view-meeting/view-meeting.component';



@NgModule({
  declarations: [AdminPageComponent, NormalUserPageComponent, MeetingHomeComponent, AddMeetingComponent, EditMeetingComponent, ViewMeetingComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    NgbModalModule,
    FormsModule,

    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
  ]
})
export class DashboardModule { }
