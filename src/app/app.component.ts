import { Component, AfterViewInit, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Socket } from 'ngx-socket-io';
import { AuthService } from './services/auth.service';
import { TimerService, TimerAlertPayload } from './services/timer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  isMobile = false;
  isWatch = false;
  showMenu = true;
  showWatchMenu = false;
  showEmergency = false;

  showPillAlert = false;
  alertMed: TimerAlertPayload | null = null;

  private touchStartX = 0;
  private touchEndX = 0;

  constructor(
    private router: Router,
    private auth: AuthService,
    private timer: TimerService,
    private socket: Socket
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.showMenu = e.urlAfterRedirects !== '/login';
      });

    this.timer.alert$.subscribe(payload => {
      this.alertMed = payload;
      this.showPillAlert = !!payload;
    });

    this.socket.fromEvent<any>('emergency:start').subscribe(() => {
      this.showEmergency = true;
    });

    this.socket.fromEvent<any>('emergency:stop').subscribe(() => {
      this.showEmergency = false;
    });
  }

  ngAfterViewInit(): void {
    const w = window.innerWidth;
    this.isWatch = w < 360;
    this.isMobile = w >= 360 && w < 768;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    const tag = (event.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (event.key.toLowerCase() === 's') {
      event.preventDefault();
      this.triggerEmergency();
    }
  }

triggerEmergency(): void {
  const userId = Number(sessionStorage.getItem('userId')) || null;
  this.showEmergency = true;
  this.socket.emit('emergency:start', { userId });
}

closeEmergency(): void {
  const userId = Number(sessionStorage.getItem('userId')) || null;
  this.showEmergency = false;
  this.socket.emit('emergency:stop', { userId });
}


  openWatchMenu(event: Event): void {
    event.stopPropagation();
    this.showWatchMenu = true;
  }

  closeWatchMenu(): void {
    this.showWatchMenu = false;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  closePillAlert(): void {
    this.timer.closeAlert();
  }

  onTouchStart(event: TouchEvent): void {
    if (!this.isWatch) return;
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.isWatch) return;
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const swipeDistance = this.touchStartX - this.touchEndX;
    if (swipeDistance > 40) {
      this.router.navigate(['/home']);
    }
  }
}
