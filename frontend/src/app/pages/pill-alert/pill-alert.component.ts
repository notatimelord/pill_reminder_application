import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { TimerService } from '../../services/timer.service';
import { SettingsService } from '../../services/settings.service';
import { ScheduleService } from '../../services/schedule.service';

@Component({
  selector: 'app-pill-alert',
  templateUrl: './pill-alert.component.html',
  styleUrls: ['./pill-alert.component.scss']
})
export class PillAlertComponent implements OnInit {

  @Input() isWatch = false;
  @Input() isMobile = false;

  @Input() userId!: number;
  @Input() logId!: string;
  @Input() medName!: string;
  @Input() dosage!: string;
  @Input() imageUrl!: string;

  @Output() close = new EventEmitter<void>();

  postponeMinutes = 5;
  soundEnabled = true;
  vibrationEnabled = true;

  private alertAudio?: HTMLAudioElement;
  private vibrationInterval?: any;

  constructor(
    private scheduleService: ScheduleService,
    private timer: TimerService,
    private socket: Socket,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    if (!this.userId) return;

    this.settingsService.getSettings(this.userId).subscribe({
      next: settings => {
        if (!settings) return;

        this.postponeMinutes = settings.postpone ?? this.postponeMinutes;
        this.soundEnabled = settings.sound !== false;
        this.vibrationEnabled = settings.vibration !== false;

        if (this.soundEnabled) {
          this.playAlertSound();
        }

        if (this.vibrationEnabled) {
          this.startVibration();
        }
      }
    });

    this.socket.fromEvent<any>('settingsUpdated').subscribe(data => {
      if (!data || data.userId !== this.userId) return;

      this.soundEnabled = data.sound;
      this.vibrationEnabled = data.vibration;

      if (!this.soundEnabled) {
        this.stopAlertSound();
      }

      if (!this.vibrationEnabled) {
        this.stopVibration();
      }
    });
  }

private playAlertSound(): void {
  this.alertAudio = new Audio('assets/sounds/notification.mp3');
  this.alertAudio.volume = this.isWatch ? 0.4 : 0.7;
  this.alertAudio.loop = true;

  this.alertAudio.play().catch(() => {});
}


  private stopAlertSound(): void {
    if (!this.alertAudio) return;
    this.alertAudio.pause();
    this.alertAudio.currentTime = 0;
    this.alertAudio = undefined;
  }

private startVibration(): void {
  if (!('vibrate' in navigator)) return;

  const pattern = this.isWatch
    ? 300
    : this.isMobile
      ? [200, 100, 200]
      : 150;

  navigator.vibrate(pattern);

  this.vibrationInterval = setInterval(() => {
    navigator.vibrate(pattern);
  }, 8000);
}

private stopVibration(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }

  if (this.vibrationInterval) {
    clearInterval(this.vibrationInterval);
    this.vibrationInterval = undefined;
  }
}


  takeNow(): void {
    if (!this.userId || !this.logId) return;

    this.scheduleService.takeDose(this.userId, this.logId).subscribe({
      next: () => {
        this.stopAlertSound();
        this.stopVibration();
        this.timer.closeAlert();
        this.socket.emit('close-alert', { userId: this.userId });
        this.close.emit();
      }
    });
  }

  snooze(): void {
    if (!this.userId || !this.logId) return;

    this.scheduleService
      .snoozeDose(this.userId, this.logId, this.postponeMinutes)
      .subscribe({
        next: () => {
          this.stopAlertSound();
          this.stopVibration();
          this.timer.closeAlert();
          this.socket.emit('close-alert', { userId: this.userId });
          this.close.emit();
        }
      });
  }
}
