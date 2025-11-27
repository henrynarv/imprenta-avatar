import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private ruoter = inject(Router);

  navigateToHome(): void {
    this.ruoter.navigate(['/home']);
  }

  navigateToLogin(): void {
    this.ruoter.navigate(['/auth/login']);
  }

  navigateToDashboard(): void {
    this.ruoter.navigate(['/dashboard']);
  }

  navigateToForgotPassword(): void {
    this.ruoter.navigate(['/auth/forgot-password']);
  }

  constructor() { }
}
