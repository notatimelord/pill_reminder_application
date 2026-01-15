import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WeeklyAdherenceDay {
  date: string;
  day: string;
  taken: number;
  late: number;
  missed: number;
  total: number;
  state: 'good' | 'ok' | 'bad';
}

export interface AdherenceResponse {
  taken: number;
  missed: number;
  late: number;
  weekly: WeeklyAdherenceDay[];
}

@Injectable({
  providedIn: 'root'
})
export class AdherenceService {

  private baseUrl = 'http://localhost:8080/api/v1/adherence';

  constructor(private http: HttpClient) {}

  getWeeklyAdherence(
    userId: number,
    days = 7
  ): Observable<AdherenceResponse> {
    return this.http.get<AdherenceResponse>(
      `${this.baseUrl}/${userId}?days=${days}`
    );
  }
}
