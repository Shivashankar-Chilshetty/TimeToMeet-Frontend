import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public email: string
  public password: string

  constructor(public userService: UserService, public toastr: ToastrService, public router: Router) { }

  ngOnInit(): void {
  }
  public goToSignUp = () => {
    this.router.navigate(['/signup'])
  }
  public login(): any {
    let userData = {
      email: this.email,
      password: this.password
    }
    this.userService.signinFunction(userData).subscribe(
      (apiResponse) => {
        //console.log(apiResponse)
        if (apiResponse.status === 200) {
          //console.log(apiResponse);
          Cookie.set('authToken', apiResponse.data.authToken)
          Cookie.set('userId', apiResponse.data.userDetails.userId)
          Cookie.set('email', apiResponse.data.userDetails.email)
          Cookie.set('firstName', apiResponse.data.userDetails.firstName)
          Cookie.set('lastName', apiResponse.data.userDetails.lastName)
          Cookie.set('permissions', apiResponse.data.userDetails.permissions)

          this.toastr.success('Login Successful', 'Welcome to TimeToMeet')
          if (Cookie.get('permissions') == 'admin' || Cookie.get('permissions') == 'Admin') {
            this.router.navigate(['/adminPage'])
          }
          else {
            this.router.navigate(['/normalUserPage'])
          }

        }
        else {
          this.toastr.error(apiResponse.message, 'Error')
        }
      },
      (error) => {
        if (error.status == 404) {
          this.toastr.warning("Login Failed", "User Not Found,Kindly register!");
        }
        else if (error.status == 400) {
          this.toastr.warning("Login Failed", "Wrong Password!");
        }
        else if (error.status == 500) {
          this.toastr.error("Some Error Occurred", "Error!");
          this.router.navigate(['/server-error']);
        }
      }
    )
  }

}


