import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdherenceComponent } from './adherence.component';
import { authGuard } from '../guards/auth-guard';

const routes: Routes = [
  {
    path: '',
    component: AdherenceComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdherenceRoutingModule {}
