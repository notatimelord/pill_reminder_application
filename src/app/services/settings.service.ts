import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Settings {
  vibration: boolean;
  sound: boolean;
  hideTimer: boolean;
  postpone: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private http: HttpClient) {}
private baseUrl = 'http://localhost:8080/api/v1/settings';

getSettings(userId: number) {
  return this.http.get<Settings>(`${this.baseUrl}/${userId}`);
}

updateSettings(userId: number, data: Settings) {
  return this.http.put<Settings>(`${this.baseUrl}/${userId}`, data);
}
}