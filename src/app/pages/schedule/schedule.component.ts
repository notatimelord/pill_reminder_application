import { Component, OnInit, OnDestroy } from '@angular/core';
import { ScheduleService } from '../../services/schedule.service';
import { Socket } from 'ngx-socket-io';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit, OnDestroy {

  meds: any[] = [];
  openedMed: any = null;

  showEarlyWarning = false;
  showUndoWarning = false;
  pendingActionMed: any = null;

  isMobile = false;
  isWatch = false;

  selectedDate = '';
  currentDate!: Date;
  dateLabel = '';

  private socketSub?: Subscription;

  constructor(
    private scheduleService: ScheduleService,
    private socket: Socket
  ) {}

  ngOnInit(): void {
    this.detectDevice();

    this.currentDate = new Date();
    this.updateDate();

    const userId = Number(sessionStorage.getItem('userId'));
    if (userId) {
      this.socket.emit('join-user', userId);
      this.listenForRemoteScheduleUpdates(userId);
    }
  }

  ngOnDestroy(): void {
    this.socketSub?.unsubscribe();
  }


  private listenForRemoteScheduleUpdates(userId: number): void {
    this.socketSub = this.socket
      .fromEvent<any>('scheduleUpdated')
      .subscribe(data => {
        if (!data) return;
        if (data.userId !== userId) return;
        if (data.date !== this.selectedDate) return;

        console.log('[SOCKET] scheduleUpdated → reloading schedule');
        this.loadSchedule();
      });
  }


  detectDevice(): void {
    const w = window.innerWidth;
    this.isWatch = w < 360;
    this.isMobile = w >= 360 && w < 768;
  }

  noop(event: Event): void {
    event.stopPropagation();
  }


  updateDate(): void {
    this.selectedDate = this.currentDate.toLocaleDateString('en-CA');
    this.dateLabel = this.formatDateLabel(this.currentDate);
    this.loadSchedule();
  }

  goPrevDay(): void {
    this.currentDate.setDate(this.currentDate.getDate() - 1);
    this.updateDate();
  }

  goNextDay(): void {
    this.currentDate.setDate(this.currentDate.getDate() + 1);
    this.updateDate();
  }

  formatDateLabel(date: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const diff = (d.getTime() - today.getTime()) / 86400000;

    if (diff === 0) return 'Today';
    if (diff === -1) return 'Yesterday';
    if (diff === 1) return 'Tomorrow';

    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }

private toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

private calculateDelayMinutes(
  scheduled: string,
  taken: string
): number {
  return this.toMinutes(taken) - this.toMinutes(scheduled);
}

loadSchedule(): void {
  const userId = Number(sessionStorage.getItem('userId'));
  if (!userId) return;

  this.scheduleService
    .getScheduleByDate(userId, this.selectedDate)
    .subscribe(data => {
      this.meds = data.map(med => {

        const takenTime = med.time
          ? new Date(med.time).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit'
            })
          : null;

        let takenStatus: 'on-time' | 'delayed' | null = null;
        let delayMinutes: number | null = null;

        if (med.taken && med.scheduledTime && takenTime) {
          delayMinutes = this.calculateDelayMinutes(
            med.scheduledTime,
            takenTime
          );

          takenStatus = delayMinutes > 5 ? 'delayed' : 'on-time';
        }

        return {
          ...med,
          time: takenTime,
          takenStatus,
          delayMinutes,
          displayTakenText:
            takenStatus === 'delayed'
              ? `Taken ${delayMinutes} min late`
              : takenStatus === 'on-time'
                ? `Taken at ${takenTime}`
                : null
        };
      });
    });
}

  openMed(med: any): void {
    this.openedMed = med;
  }

isTodaySelected(): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = new Date(this.selectedDate);
  selected.setHours(0, 0, 0, 0);

  return selected.getTime() === today.getTime();
}


take(med: any): void {
  if (!this.isTodaySelected()) return;

  if (med.in !== 'Now') {
    this.pendingActionMed = med;
    this.showEarlyWarning = true;
    return;
  }

  this.confirmTake(med);
}

  confirmEarly(): void {
    if (!this.pendingActionMed) return;
    this.confirmTake(this.pendingActionMed);
    this.showEarlyWarning = false;
    this.pendingActionMed = null;
  }

  cancelEarly(): void {
    this.showEarlyWarning = false;
    this.pendingActionMed = null;
  }

  confirmTake(med: any): void {
    const userId = Number(sessionStorage.getItem('userId'));
    if (!userId) return;

    this.scheduleService
      .takeDose(userId, med.logId)
      .subscribe(() => {
        this.openedMed = null;
        this.loadSchedule(); 
      });
  }


triggerUndo(med: any): void {
  if (!this.isTodaySelected()) return;

  this.pendingActionMed = med;
  this.showUndoWarning = true;
}

  confirmUndo(): void {
    if (!this.pendingActionMed) return;

    const userId = Number(sessionStorage.getItem('userId'));
    if (!userId) return;

    this.scheduleService
      .undoDose(userId, this.pendingActionMed.logId)
      .subscribe(() => {
        this.showUndoWarning = false;
        this.openedMed = null;
        this.pendingActionMed = null;
        this.loadSchedule();
      });
  }

  cancelUndo(): void {
    this.showUndoWarning = false;
    this.pendingActionMed = null;
  }


  private utcHHmmToLocal(hhmm: string): string {
    const [h, m] = hhmm.split(':').map(Number);

    const d = new Date();
    d.setUTCHours(h, m, 0, 0);

    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
