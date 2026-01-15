import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-emergency',
  templateUrl: './emergency.component.html',
  styleUrls: ['./emergency.component.scss']
})
export class EmergencyComponent implements OnInit, OnDestroy {

  @Input() isMobile = false;
  @Input() isWatch = false;

  @Output() close = new EventEmitter<void>();

  private emergencyAudio?: HTMLAudioElement;

  ngOnInit(): void {
      this.startEmergencySound();
      this.startVibration();
  }

  ngOnDestroy(): void {
    this.stopEmergencySound();
  }

  private startEmergencySound(): void {
    this.emergencyAudio = new Audio('assets/sounds/emergency.mp3');
    this.emergencyAudio.loop = true;
    this.emergencyAudio.volume = 0.7;

    this.emergencyAudio.play().catch(() => {
    });
  }

  private stopEmergencySound(): void {
    if (this.emergencyAudio) {
      this.emergencyAudio.pause();
      this.emergencyAudio.currentTime = 0;
      this.emergencyAudio = undefined;
    }
  }

  private startVibration(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate([600, 300, 600, 300, 600]);
    }
  }

  onCancel(): void {
    this.stopEmergencySound();
    this.close.emit();
  }
}
