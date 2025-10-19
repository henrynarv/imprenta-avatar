import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class aAuthService {

  userRole = signal<'user' | 'admin'>('user');

  isAuthenticated = signal<boolean>(false);

  user = signal<{ name: string, avatar: string, email: string }>({
    name: 'Sebastian',
    avatar: '/images/user-avatar.png',
    email: 'henrynarvaezchaevez_854@example.com'
  })


  switchRole(role: 'user' | 'admin') {
    this.userRole.set(role);
  }
  constructor() { }
}
