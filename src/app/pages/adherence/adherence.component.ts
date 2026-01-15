import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Socket } from 'ngx-socket-io';

import {
  AdherenceService,
  WeeklyAdherenceDay
} from '../../services/adherence.service';

@Component({
  selector: 'app-adherence',
  templateUrl: './adherence.component.html',
  styleUrls: ['./adherence.component.scss']
})
export class AdherenceComponent implements OnInit, OnDestroy {

  isMobile = false;
  isWatch = false;

  late = 0;
  taken = 0;
  missed = 0;
  weekly: WeeklyAdherenceDay[] = [];

  statusText = '';
  tip = '';

  private adherenceSocketSub?: Subscription;

  constructor(
    private adherenceService: AdherenceService,
    private socket: Socket
  ) {}

  ngOnInit(): void {
    this.detectDevice();
    this.loadAdherence();
    this.adherenceSocketSub = this.socket
      .fromEvent<any>('adherenceUpdated')
      .subscribe(payload => {
        const userId = Number(sessionStorage.getItem('userId'));
        if (!payload || payload.userId !== userId) return;

        console.log('[SOCKET] adherenceUpdated received');
        this.loadAdherence();
      });
  }

  ngOnDestroy(): void {
    this.adherenceSocketSub?.unsubscribe();
  }

  private loadAdherence(): void {
    const userId = Number(sessionStorage.getItem('userId'));
    if (!userId) return;

    this.adherenceService
      .getWeeklyAdherence(userId)
      .subscribe(res => {
        this.taken = res.taken;
        this.missed = res.missed;
        this.late = res.late;
        this.weekly = res.weekly;

        this.computeStatus();
      });
  }
private computeStatus(): void {
  const total = this.taken + this.missed;
  if (total === 0) {
    this.statusText = 'No scheduled doses yet';
    this.tip = 'Your adherence will appear once doses are scheduled.';
    return;
  }

  const onTime = this.taken - this.late;

  const onTimeRatio = onTime / total;
  const lateRatio = this.late / this.taken || 0;

  if (onTimeRatio === 1 && this.late === 0) {
    this.statusText = 'Perfect adherence!';
    this.tip =
      'All doses were taken on time. Excellent consistency!';
    return;
  }
  if (this.taken === total && this.late > 0) {
    this.statusText = 'All doses taken but be persistent.';
    this.tip =
      'Great job taking all your medication. Try to take them closer to the scheduled time.';
    return;
  }
  if (onTimeRatio >= 0.7 && lateRatio <= 0.3) {
    this.statusText = 'Doing well';
    this.tip =
      'Most doses were taken on time. A bit more consistency will make it even better.';
    return;
  }

  if (this.late > 0 && lateRatio > 0.5) {
    this.statusText = 'Frequent late doses';
    this.tip =
      'Many doses were taken late. Setting reminders a bit earlier could help.';
    return;
  }

  this.statusText = 'Needs attention';
  this.tip =
    'Several doses were missed or taken late. Staying on schedule is important for effectiveness.';
}

  private detectDevice(): void {
    const w = window.innerWidth;
    this.isWatch = w <= 360;
    this.isMobile = w > 360 && w <= 768;
  }
}
