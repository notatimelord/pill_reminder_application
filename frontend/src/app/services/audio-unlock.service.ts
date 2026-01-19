import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioUnlockService {

  private unlocked = false;

  unlock(): void {
    if (this.unlocked) return;

    const audio = new Audio('assets/sounds/silence.mp3');
    audio.volume = 0;

    audio.play()
      .then(() => {
        this.unlocked = true;
      })
      .catch(() => {});
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }
}
