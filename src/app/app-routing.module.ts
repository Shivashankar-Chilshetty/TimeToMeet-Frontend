import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddMeetingComponent } from './dashboard/add-meeting/add-meeting.component';
import { AdminPageComponent } from './dashboard/admin-page/admin-page.component';
import { EditMeetingComponent } from './dashboard/edit-meeting/edit-meeting.component';
import { MeetingHomeComponent } from './dashboard/meeting-home/meeting-home.component';
import { NormalUserPageComponent } from './dashboard/normal-user-page/normal-user-page.component';
import { ViewMeetingComponent } from './dashboard/view-meeting/view-meeting.component';
import { ServerErrorComponent } from './server-error/server-error.component';
import { ForgotPasswordComponent } from './user/forgot-password/forgot-password.component';
import { LoginComponent } from './user/login/login.component';
import { ResetPasswordComponent } from './user/reset-password/reset-password.component';
import { SignupComponent } from './user/signup/signup.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent, pathMatch: 'full' },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:validationToken', component: ResetPasswordComponent },

  { path: 'adminPage', component: AdminPageComponent },
  { path: 'normalUserPage', component: NormalUserPageComponent },
  { path: 'meeting-home/:userId', component: MeetingHomeComponent },
  { path: 'add-meeting/:userId', component: AddMeetingComponent },
  { path: 'edit-meeting/:meetingId', component: EditMeetingComponent },
  { path: 'view-meeting/:meetingId', component: ViewMeetingComponent },

  { path: 'server-error', component: ServerErrorComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '*', component: LoginComponent },
  { path: '**', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
