import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { AuthService } from '../../services/auth.service';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  isMobile = false;
  isPhone = false;
  isPhoneTall = false;
  isWatch = false;

  vibration = true;
  sound = true;
  hideTimer = false;

  postponeOptions = [5, 15, 25];
  counter = 5;

  userId!: number;

  constructor(
    private settingsService: SettingsService,
    private auth: AuthService,
    private socket: Socket
  ) {}

  ngOnInit(): void {
    this.detectDevice();

    const id = this.auth.getUserId();
    if (!id) {
      console.error('Settings: user not logged in');
      return;
    }

    this.userId = id;

    this.socket.emit('join-user', this.userId);

    this.loadSettings();
    this.listenForRemoteUpdates();
  }

  private detectDevice(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.isMobile = w >= 360 && w <= 768;

    this.isWatch = w < 360;

    this.isPhone = this.isMobile && !this.isWatch;
    this.isPhoneTall = this.isPhone && h > 800;
  }

  private loadSettings(): void {
    this.settingsService.getSettings(this.userId).subscribe(settings => {
      if (!settings) return;

      this.vibration = settings.vibration;
      this.sound = settings.sound;
      this.hideTimer = settings.hideTimer;
      this.counter = settings.postpone;
    });
  }

  private listenForRemoteUpdates(): void {
    this.socket.fromEvent<any>('settingsUpdated').subscribe(data => {
      if (!data || data.userId !== this.userId) return;

      this.vibration = data.vibration;
      this.sound = data.sound;
      this.hideTimer = data.hideTimer;
      this.counter = data.postpone;
    });
  }

  private saveSettings(): void {
    if (!this.userId) return;

    this.settingsService.updateSettings(this.userId, {
      vibration: this.vibration,
      sound: this.sound,
      hideTimer: this.hideTimer,
      postpone: this.counter
    }).subscribe();
  }

  increase(): void {
    const idx = this.postponeOptions.indexOf(this.counter);
    this.counter =
      this.postponeOptions[(idx + 1) % this.postponeOptions.length];
    this.saveSettings();
  }

  decrease(): void {
    const idx = this.postponeOptions.indexOf(this.counter);
    this.counter =
      this.postponeOptions[
        (idx - 1 + this.postponeOptions.length) %
        this.postponeOptions.length
      ];
    this.saveSettings();
  }

  setPostpone(value: number): void {
    this.counter = value;
    this.saveSettings();
  }

  onToggleVibration(): void {
    this.vibration = !this.vibration;
    this.saveSettings();
  }

  onToggleSound(): void {
    this.sound = !this.sound;
    this.saveSettings();
  }

  onToggleTimer(): void {
    this.hideTimer = !this.hideTimer;
    this.saveSettings();
  }
}