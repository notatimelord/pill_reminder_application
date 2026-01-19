import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from './pages/guards/auth-guard';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [

  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module')
        .then(m => m.LoginModule)
  },

  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard]
  },

  {
    path: 'schedule',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/schedule/schedule.module')
        .then(m => m.ScheduleModule)
  },

  {
    path: 'settings',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/settings/settings.module')
        .then(m => m.SettingsModule)
  },

  {
    path: 'adherence',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/adherence/adherence.module')
        .then(m => m.AdherenceModule)
  },

   {
    path: 'speaker',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/speaker/speaker.module')
        .then(m => m.SpeakerModule)
  },


  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
