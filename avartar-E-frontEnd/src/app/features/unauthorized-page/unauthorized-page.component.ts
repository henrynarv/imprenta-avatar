import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroHome, heroLockClosed, heroShieldExclamation } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-unauthorized-page',
  imports: [NgIcon],
  templateUrl: './unauthorized-page.component.html',
  styleUrl: './unauthorized-page.component.scss',
  providers: [
    provideIcons({
      heroLockClosed,
      heroHome,
      heroArrowLeft,
      heroShieldExclamation
    })
  ]
})
export class UnauthorizedPageComponent {
  private router = inject(Router);

  //señales para estados interactivos
  // isHoveringBack = signal<boolean>(false);
  // isHoveringHome = signal<boolean>(false);

  goBack(): void {
    window.history.back();
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
