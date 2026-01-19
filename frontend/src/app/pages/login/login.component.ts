import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AudioUnlockService } from '../../services/audio-unlock.service';

type DeviceType = 'watch' | 'phone' | 'large';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  surname = '';
  doctorPasswordId = '';

  loginError = '';

  device: DeviceType = 'large';

  get isWatch() {
    return this.device === 'watch';
  }

  get isPhone() {
    return this.device === 'phone';
  }

  get isLarge() {
    return this.device === 'large';
  }

  constructor(
    private router: Router,
    private auth: AuthService,
    private audioUnlock: AudioUnlockService
  ) {}

  ngOnInit(): void {
    this.detectDevice();
  }

  private detectDevice(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (w <= 360 && h <= 360) {
      this.device = 'watch';
    } else if (w <= 767) {
      this.device = 'phone';
    } else {
      this.device = 'large';
    }
  }

login(): void {
  this.loginError = '';

  this.audioUnlock.unlock();

  this.auth.login(this.surname, this.doctorPasswordId).subscribe({
    next: (res: any) => {
      const userId = res?.user?._id;

      if (userId === undefined || userId === null) {
        this.loginError = 'Login failed (no user id)';
        return;
      }

      sessionStorage.setItem('loggedIn', 'true');
      sessionStorage.setItem('userId', String(userId));
      sessionStorage.setItem('user', JSON.stringify(res.user));

      this.router.navigate(['/home']);
    },
    error: () => {
      this.loginError = 'Invalid surname or password';
    }
  });
}
}
