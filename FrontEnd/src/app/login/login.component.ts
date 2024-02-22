import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IP } from '../app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private router: Router,
    private ipBackend: IP
  ) {}

  user = {
    loginUser: null,
    username: null,
    email: null,
    password: null,
    cpassword: null,
  };

  loginUser = {
    loginUser: null,
    password: null,
  };

  token: string | null = null;
  flag: boolean = true;
  loading: boolean = false;

  ngOnInit(): void {
    this.token = sessionStorage.getItem('token');
    if(this.token){
      this.router.navigate(['/map']);
    }
  }

  login() {
    this.loading = true;
    this.http.post(this.ipBackend.ipBackend + 'login-user', this.loginUser)
      .subscribe((response: any) => {
        this.loading = false;
        if (response.ok){
          sessionStorage.setItem('token', response.token);
          this.router.navigate(['/map']);
        }else{
          Swal.fire('Error!', response.message, 'error');
          this.flag = !this.flag;
        }
      });
  }

  register() {
    this.loading = true;
    if (this.user.password === this.user.cpassword){
      this.http.post(this.ipBackend.ipBackend + 'register-user',this.user)
      .subscribe((response: any) => {
        this.loading = false;
        if(response.ok){
          sessionStorage.setItem('token', response.token);
          Swal.fire('Perfecto!', response.message, 'success');
          this.router.navigate(['/map']);
        }else {
          Swal.fire('Error!', response.message, 'error');
        }
      });
    }else{
      Swal.fire('Error!', 'Las contraseñas no coinciden, verifica que estén bien escritas!', 'error');
    }

    
  }

  sigInB() {
    this.flag = !this.flag;
  }

  sigUpB() {
    this.flag = !this.flag;
  }
}
