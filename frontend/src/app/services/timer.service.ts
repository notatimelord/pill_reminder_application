import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TimerAlertPayload {
  userId: number;
  logId: string;
  name: string;
  dosage: string;
  image: string;
}

@Injectable({ providedIn: 'root' })
export class TimerService {

  private target!: Date;
  private interval: any;

  private currentPayload: TimerAlertPayload | null = null;
  private snoozedLogId: string | null = null;

  private alertSubject = new BehaviorSubject<TimerAlertPayload | null>(null);
  alert$ = this.alertSubject.asObservable();

  start(target: Date, payload: TimerAlertPayload): void {
    this.currentPayload = payload;
    this.snoozedLogId = payload.logId;
    this.target = target;

    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      const diff = this.target.getTime() - Date.now();

      if (diff <= 0) {
        clearInterval(this.interval);
        this.interval = null;

        if (!this.currentPayload) return;
        this.snoozedLogId = null;
        this.alertSubject.next(this.currentPayload);
      }
    }, 1000);
  }

  isSnoozed(logId: string): boolean {
    return this.snoozedLogId === logId;
  }

  getCurrentPayload(): TimerAlertPayload | null {
    return this.currentPayload;
  }

  clearCurrentPayload(): void {
    this.currentPayload = null;
    this.snoozedLogId = null;
  }

  closeAlert(): void {
    this.alertSubject.next(null);
  }
}
