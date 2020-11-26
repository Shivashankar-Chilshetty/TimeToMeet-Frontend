import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from 'src/app/services/socket.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {


  public users = [];
  public message = '';
  public authToken: string;
  public name: string;
  public flag: boolean = false;

  constructor(private userService: UserService, public socketService: SocketService, public toastr: ToastrService, private router: Router) { }

  ngOnInit(): void {

    this.authToken = Cookie.get('authToken')
    //console.log(this.authToken)
    this.name = Cookie.get('firstName')
    if (Cookie.get('permissions') == 'Admin' || Cookie.get('permissions') == 'admin') {
      this.checkStatus()
      this.verifyUserConfirmation()
      this.authError()
      this.getAllUsers(this.authToken)
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




  public getAllUsers: any = (authToken) => {
    this.userService.getAllUsers(authToken).subscribe(
      (data) => {
        this.flag = true;
        //console.log(data)
        if (data.status === 200) {
          this.users = data.data
          //console.log(this.users)
          //this.toastr.success('User details found','Success')
        }
        else if (data.status == 404) {
          this.flag = true;
          this.toastr.error(data.message, "Error!");
        }
        else if (data.status == 500) {
          this.flag = true;
          this.toastr.error(data.message, 'Error')
          this.router.navigate(['/server-error'])
        }
      },
      (error) => {
        this.flag = true;
        this.message = error;
        console.log(this.message)
        this.toastr.error('Some error occured', 'Error')
      }
    )
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

}
