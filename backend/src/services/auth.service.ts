import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API = '/api/login';
  private currentUser: any = null;

  constructor(private http: HttpClient) {}
login(surname: string, password: string) {
  return this.http.post<any>('/api/login', {
    surname,
    password
  });
}



  logout() {
    sessionStorage.clear();
    this.currentUser = null;
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem('loggedIn') === 'true';
  }

  getUser() {
    if (!this.currentUser) {
      const u = sessionStorage.getItem('user');
      this.currentUser = u ? JSON.parse(u) : null;
    }
    return this.currentUser;
  }
}
