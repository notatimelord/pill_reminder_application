import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpeakerComponent } from './speaker.component';

const routes: Routes = [
  {
    path: '',
    component: SpeakerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpeakerRoutingModule {}