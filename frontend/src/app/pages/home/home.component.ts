import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TimerService } from '../../services/timer.service';
import { ScheduleService } from '../../services/schedule.service';
import { Socket } from 'ngx-socket-io';
import { Subscription } from 'rxjs';

interface UserProfile {
  id?: number;
  firstName?: string;
  lastName?: string;
  age?: number;
  condition?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
today = new Date();
now = new Date();
greeting = '';

private clockInterval?: any;

user?: UserProfile;
avatarUrl = 'assets/icons/woman.png';

  private socketSub?: Subscription;

  isMobile = false;
  isWatch = false;
 
  nextMedTarget!: Date;
  countdownInterval: any = null;

  countdownHours = '00';
  countdownMinutes = '00';
  countdownSeconds = '00';

  nextMedName = '';
  nextMedDosage = '';
  nextMedImage = '';
  nextMedTip = '';

  constructor(
    private scheduleService: ScheduleService,
    private auth: AuthService,
    private router: Router,
    private timer: TimerService,
    private socket: Socket
  ) {}

  ngOnInit(): void {
    const width = window.innerWidth;
    this.isWatch = width <= 360;
    this.isMobile = width >= 311 && width < 900;
    const userId = this.auth.getUserId();
    
    if (userId === null) return;
    
    const rawUser = sessionStorage.getItem('user');
    if (rawUser) {
      this.user = JSON.parse(rawUser);
      this.resolveAvatar();
    }

    this.socket.emit('join-user', userId);
    this.listenForScheduleUpdates(userId);
    this.loadNextMedication(userId);
    this.clockInterval = setInterval(() => {
        this.now = new Date();
        this.today = new Date();
        this.updateGreeting();
}, 1000);
this.updateGreeting();


  }

ngOnDestroy(): void {
  if (this.countdownInterval) {
    clearInterval(this.countdownInterval);
  }

  if (this.clockInterval) {
    clearInterval(this.clockInterval);
  }

  this.socketSub?.unsubscribe();
}
private updateGreeting(): void {
  const hour = this.today.getHours();

  if (hour < 12) {
    this.greeting = 'Good morning';
  } else if (hour < 18) {
    this.greeting = 'Good afternoon';
  } else {
    this.greeting = 'Good evening';
  }
}


  private listenForScheduleUpdates(userId: number): void {
    this.socketSub = this.socket
      .fromEvent<any>('scheduleUpdated')
      .subscribe(data => {
        if (!data) return;
        if (data.userId !== userId) return;
        this.loadNextMedication(userId);
      });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key.toLowerCase() === 'e') {
      this.forceTenSecondCountdown();
    }
  }

  private forceTenSecondCountdown(): void {
    const current = this.timer.getCurrentPayload();
    if (!current) return;

    const target = new Date(Date.now() + 10_000);
    this.nextMedTarget = target;

    this.timer.start(target, current);
    this.startCountdown();
  }

  goToMedication(): void {
    this.router.navigate(['/medication']);
  }

  private loadNextMedication(userId: number): void {
    const today = new Date();
    this.loadFromDate(userId, today);
  }

private loadFromDate(userId: number, date: Date): void {
  const dateStr = date.toLocaleDateString('en-CA');

  this.scheduleService
    .getScheduleByDate(userId, dateStr)
    .subscribe(logs => {
      if (!logs?.length) return;

      const upcoming = logs
        .filter((l: any) => !l.taken)
        .map((l: any) => {
          const target = new Date(
            `${dateStr}T${l.scheduledTime}:00`
          );
          return { ...l, target };
        })
        .sort(
          (a: any, b: any) =>
            a.target.getTime() - b.target.getTime()
        );

      if (upcoming.length === 0) {
        const tomorrow = new Date(date);
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.loadFromDate(userId, tomorrow);
        return;
      }

      const next = upcoming[0];
this.nextMedName = next.name;
this.nextMedDosage = next.dosage;
this.nextMedImage = next.image_url;
this.nextMedTip = next.tip;
this.nextMedTarget = next.target;

if (this.timer.isSnoozed(next.logId)) {
  this.startCountdown();
  return;
}
this.timer.start(this.nextMedTarget, {
  userId,
  logId: next.logId,
  name: next.name,
  dosage: next.dosage,
  image: next.image_url
});

this.startCountdown();
});
}

private resolveAvatar(): void {
  if (!this.user) return;

  const id = Number(this.user.id ?? this.auth.getUserId());

  if (id === 1) {
    this.avatarUrl = 'assets/icons/old_lady.png';
  } else if (id === 2) {
    this.avatarUrl = 'assets/icons/woman.png';
  } else {
    this.avatarUrl = 'assets/icons/young_man.png';
  }
}


  private startCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.updateCountdown();

    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  private updateCountdown(): void {
    const diffMs = this.nextMedTarget.getTime() - Date.now();

    if (diffMs <= 0) {
      this.countdownHours = '00';
      this.countdownMinutes = '00';
      this.countdownSeconds = '00';
      return;
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    this.countdownHours = String(hours).padStart(2, '0');
    this.countdownMinutes = String(minutes).padStart(2, '0');
    this.countdownSeconds = String(seconds).padStart(2, '0');
  }
}

