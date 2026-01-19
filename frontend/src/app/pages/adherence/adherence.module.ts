import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdherenceComponent } from './adherence.component';
import { AdherenceRoutingModule } from './adherence-routing.module';

@NgModule({
  declarations: [AdherenceComponent],
  imports: [
    CommonModule,
    AdherenceRoutingModule
  ]
})
export class AdherenceModule {}
