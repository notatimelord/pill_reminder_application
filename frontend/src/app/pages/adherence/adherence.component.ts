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

  taken = 0;
  late = 0;
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
        this.late = res.late;
        this.missed = res.missed;
        this.weekly = res.weekly;

        this.computeStatus();
      });
  }

  private computeStatus(): void {
    const total = this.taken + this.late + this.missed;

    if (total === 0) {
      this.statusText = 'No scheduled doses yet';
      this.tip = 'Your adherence will appear once doses are scheduled.';
      return;
    }

    const onTimeRatio = this.taken / total;
    const lateRatio = this.late / total;

    if (this.taken === total) {
      this.statusText = 'Perfect adherence!';
      this.tip = 'All doses were taken on time. Excellent consistency!';
      return;
    }

    if (this.taken + this.late === total && this.late > 0) {
      this.statusText = 'All doses taken, some late';
      this.tip =
        'You took all doses, but some were late. Try to stay closer to the schedule.';
      return;
    }

    if (onTimeRatio >= 0.7) {
      this.statusText = 'Doing well';
      this.tip =
        'Most doses were taken on time. A bit more consistency will help.';
      return;
    }

    if (lateRatio > 0.5) {
      this.statusText = 'Frequent late doses';
      this.tip =
        'Many doses were taken late. Earlier reminders could help.';
      return;
    }

    this.statusText = 'Needs attention';
    this.tip =
      'Several doses were missed or taken late. Staying on schedule is important.';
  }

  private detectDevice(): void {
    const w = window.innerWidth;
    this.isWatch = w <= 360;
    this.isMobile = w > 360 && w <= 768;
  }
}
