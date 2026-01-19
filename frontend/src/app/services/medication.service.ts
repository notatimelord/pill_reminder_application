import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MedicationService {

  private baseUrl = 'http://localhost:8080/api/v1/medications';

  constructor(private http: HttpClient) {}

  getNextMedication(userId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/next/${userId}`);
  }
}
