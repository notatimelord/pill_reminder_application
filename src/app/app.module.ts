import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HomeComponent } from './pages/home/home.component';
import { PillAlertComponent } from './pages/pill-alert/pill-alert.component';
import { EmergencyComponent } from './pages/emergency/emergency.component';

const socketConfig: SocketIoConfig = {
  url: 'http://localhost:8080',
  options: {}
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PillAlertComponent,
    EmergencyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SocketIoModule.forRoot(socketConfig)
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
