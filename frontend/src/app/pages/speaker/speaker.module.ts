import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpeakerComponent } from './speaker.component';
import { SpeakerRoutingModule } from './speaker-routing.module';

@NgModule({
  declarations: [SpeakerComponent],
  imports: [
    CommonModule,          
    SpeakerRoutingModule
  ]
})
export class SpeakerModule {}
