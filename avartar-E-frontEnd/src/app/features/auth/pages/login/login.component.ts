import { Component, inject, signal } from '@angular/core';
import { LoginFormComponent } from "../../components/login-form/login-form.component";
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LoginRequest, SocialLoginRequest } from '../../interfaces/auth-interface';
import { NgIcon, provideIcons } from "@ng-icons/core";
import { heroPrinter } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-login',
  imports: [LoginFormComponent, NgIcon],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [provideIcons({ heroPrinter })]
})
export class LoginComponent {

  year = signal<number>(new Date().getFullYear());
  private authService = inject(AuthService);
  private router = inject(Router);

  // Subject para manejo de subscriptions y evitar memory leaks
  private destroy$ = new Subject<void>();


  isLoading = signal<boolean>(false);
  errorMesage = signal<string | null>('');



  onLoginSubmit(credentials: LoginRequest) {
    this.isLoading.set(true);
    this.errorMesage.set(null);

    this.authService.login(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            //la redirecion se maneja en el servicio
            console.log('Proceso de login completado');
            this.isLoading.set(false);
            this.errorMesage.set(null);
          } else {
            this.errorMesage.set(response.message);
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          this.errorMesage.set(error.message || 'Error desconocido al iniciar sesión');
          this.isLoading.set(false);
        }, complete: () => {
          this.isLoading.set(false);
        }
      })
  }

  //Maneja el login conredes sociales
  onSocialLogin(provider: string): void {
    this.isLoading.set(true);
    this.errorMesage.set(null);

    const socialData: SocialLoginRequest = {
      provider: provider as 'google',
      token: 'mock_social_token' // En producción, obtener del SDK correspondiente
    };

    this.authService.loginWithSocial(socialData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {

            this.errorMesage.set(null);
          } else {
            this.errorMesage.set(response.message);
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          this.errorMesage.set(error.message || ` Error desconocido al iniciar sesión con ${provider}`);
          this.isLoading.set(false);
        }
      })
  }


  //impia las subscriptions cuando el componente se destruye
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
