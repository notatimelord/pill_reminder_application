import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8080/api/v1/auth';


  constructor(private http: HttpClient) {}
login(surname: string, password: string) {
  return this.http.post<any>(
    `${this.baseUrl}/login`,
    { surname, password }
  ).pipe(
    tap(res => {
      localStorage.setItem('user', JSON.stringify(res.user));
    })
  );
}

  getUserId(): number | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;

    try {
      const user = JSON.parse(raw);
      return user._id ?? null;
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('user');
  }
}

