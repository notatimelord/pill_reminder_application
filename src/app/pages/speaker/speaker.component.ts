import { Component, OnInit } from '@angular/core';
import { SmartSpeakerService } from '../../services/smart-speaker.service';
import { AuthService } from '../../services/auth.service';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'speaker',
  templateUrl: './speaker.component.html',
  styleUrls: ['./speaker.component.scss']
})
export class SpeakerComponent implements OnInit {

  listening = false;

  constructor(
    private speaker: SmartSpeakerService,
    private auth: AuthService,
  ) { }

  // Register voice commands
  ngOnInit(): void {

    this.speaker.addCommand(
      'TYPE OF PILL',
      ['next pill', 'medication', 'medicine'],
      () => this.sayNextPill()
    );

    this.speaker.addCommand(
      'TIME',
      ['when', 'next pill', 'time', 'date', 'take now'],
      () => this.sayNextPillTime()
    );

    this.speaker.addCommand(
      'END',
      ['stop listening', 'goodbye'],
      () => this.stop()
    );

    this.speaker.addCommand(
      'PLAY_GAME',
      ['play', 'game'],
      () => this.playGame()
    );

    this.speaker.addCommand(
      'EMERGENCY',
      ['feel bad', 'dying', 'call mom', 'call doctor'],
      () => this.emergencyCall()
    );

    // Initialize speech recognition AFTER commands
    this.speaker.initialize();
    this.speaker.refreshGrammar();
  }

  toggleListening() {
    console.log("Button");
    if (this.listening) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    console.log("start");
    this.listening = true;
    this.speaker.speak('Hello. How can I help you?');
    this.speaker.start();
  }

  stop() {
    this.listening = false;
    this.speaker.speak('Stopping voice assistant.');
    this.speaker.stop();
  }

  // -----------------------
  // Mock medical responses
  // -----------------------

  sayNextPill() {
    this.speaker.speak(
      'Your next pill is Paracetamol, 500 milligrams.'
    );
  }

  sayNextPillTime() {
    this.speaker.speak(
      'Your next pill is scheduled for 6 PM.'
    );
  }

  emergencyCall() {
    this.speaker.speak(
      'Calling dr whatever'
    );
  }

  playGame() {
    this.speaker.speak(
      'Think a number from 1 to 10'
    );
  }
}
