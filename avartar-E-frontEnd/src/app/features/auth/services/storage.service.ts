import { Injectable } from '@angular/core';
import { User } from '../models/auth-interface';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly AUTH_KEY = 'auth_data';


  saveAuthData(authData: { user: User, token: string, tokenType?: string, expiresAt?: string }) {
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(authData));
  }

  getAuthData(): { user: User; token: string; tokenType?: string; expiresAt?: string } | null {
    const data = localStorage.getItem(this.AUTH_KEY);
    return data ? JSON.parse(data) : null;
  }

  removeAuthData(): void {
    localStorage.removeItem(this.AUTH_KEY);
  }

  getToken(): string | null {
    const authData = this.getAuthData();
    return authData?.token || null;
  }

  getUser(): User | null {
    const authData = this.getAuthData();
    return authData?.user || null;
  }



}
