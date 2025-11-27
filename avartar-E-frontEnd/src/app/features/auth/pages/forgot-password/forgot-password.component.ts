import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroCheckCircle, heroClock, heroEnvelope, heroExclamationTriangle, heroLockClosed } from '@ng-icons/heroicons/outline';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiResposnse, ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest } from '../../models/auth-interface';
import { AuthStateService } from '../../services/auth-state.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { NavigationService } from '../../services/navigation.service';
import { AlertService } from '../../../../shared/service/alert.service';
import { VersionService } from '../../../../core/services/version.service';
import { RateLimitService } from '../../services/rate-limit.service';

@Component({
  selector: 'app-forgot-password',
  imports: [NgIcon, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  providers: [
    provideIcons({
      heroEnvelope, heroLockClosed, heroArrowLeft, heroCheckCircle, heroClock, heroExclamationTriangle
    })
  ],
})
export class ForgotPasswordComponent {

  currentYear = new Date().getFullYear();
  appVersion = "";

  //Inyeccionde servicos
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private rateLimitService = inject(RateLimitService);
  private authStateService = inject(AuthStateService);
  private errorHandlerService = inject(ErrorHandlerService);
  private navigationService = inject(NavigationService);
  private alertService = inject(AlertService);
  private versionService = inject(VersionService);


  private destroy$ = new Subject<void>();

  //señles del componente
  private _isSubmitting = signal<boolean>(false);
  private _showSuccessMessage = signal<boolean>(false);
  private _emailSent = signal<boolean>(false);
  private _errorMessage = signal<string | null>(null);
  private _countdownJustEnded = signal<boolean>(false);


  //computed de la propiedades -  INTEGRADO CON AuthStateService
  isSubmitting = computed(() => this._isSubmitting() || this.authStateService.isLoading());
  emailSent = computed(() => this._emailSent());
  errorMessage = computed(() => this._errorMessage() || this.authStateService.error());


  //computed desde RateLimitService
  isRateLimited = computed(() => this.rateLimitService.isRateLimited());
  formattedCountdown = computed(() => this.rateLimitService.formattedTimeRemaining());
  showSuccessMessage = this._showSuccessMessage.asReadonly();



  //Formmlario para solicitar restablecimiento
  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  //Obtener controles del formulario para tener acceso fácil en template
  get formControls() {
    return this.forgotPasswordForm.controls;
  }

  //maneja el envio del formulario de solicitud de reset
  onForgotPasswordSubmit(): void {
    this.forgotPasswordForm.markAllAsTouched();
    this._errorMessage.set(null);


    //verificamos rate limitting
    if (this.isRateLimited()) {
      this._errorMessage.set(`Debes esperar ${this.formattedCountdown()} antes de solicitar otro enlace.`);
      this.scrollToError()
      return;
    }

    if (this.forgotPasswordForm.valid) {
      this._isSubmitting.set(true);
      //MAPEO DE DATOS COINCIDIENDO CON ForgotPasswordRequest DEL BACKEND
      const requestData: ForgotPasswordRequest = {
        email: (this.formControls.email.value ?? '').trim().toLowerCase(),
      }

      //lamma al servico  y a la respuesta ApiResponse de backend
      this.authService.forgotPassword(requestData).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: ApiResposnse<ForgotPasswordResponse>) => {
            this._emailSent.set(true);
            this._showSuccessMessage.set(true); // ← MOSTRAR MENSAJE SOLO EN ÉXITO
            this._isSubmitting.set(false);

            // MANEJO DE RATE LIMITING MEJORADO - El servicio con signals se encarga automáticamente
            if (response.data) {
              this.rateLimitService.handleRateLimitResponse(response.data);
            }

            //Notificación de exito
            this.alertService.success(
              'Email enviado',
              'Revisa tu correo para restablecer tu contraseña'
            )
          },
          error: (error) => {
            const errorMessage = this.errorHandlerService.handleAuthError(error);
            this._errorMessage.set(errorMessage);
            this._isSubmitting.set(false);
            this._showSuccessMessage.set(false); // ← OCULTAR EN ERROR
            this.scrollToError();
          }
        });
    } else {
      this._errorMessage.set('Por favor, ingresa un email válido.');
      this.scrollToError();
    }
  }

  //Reenviar email de recuperación
  resendRecoveryEmail(): void {

    //verificar rate limitting

    if (this.isRateLimited()) {
      this._errorMessage.set(`Debes esperar ${this.formattedCountdown()} antes de solicitar otro enlace.`);
      this.scrollToError()
      return;
    }

    this._errorMessage.set(null);
    if (this.formControls.email.valid) {
      this._isSubmitting.set(true);

      const requestData: ForgotPasswordRequest = {
        email: (this.formControls.email.value ?? '').trim().toLowerCase()
      };

      // Reenviar la solicitud de reset
      this.authService.forgotPassword(requestData).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: ApiResposnse<ForgotPasswordResponse>) => {
            this._emailSent.set(true);
            this._showSuccessMessage.set(true);
            this._isSubmitting.set(false);

            // ✅ MANEJAR RATE LIMITING IGUAL QUE EN EL MÉTODO PRINCIPAL
            if (response.data) {
              this.rateLimitService.handleRateLimitResponse(response.data);
            }


            //Notificación d exito
            this.alertService.success(
              'Email reenviado',
              'Hemos enviado un nuevo enlace de recuperación a tu correo'
            )
          },
          error: (error) => {
            const errorMessage = this.errorHandlerService.handleAuthError(error);
            this._errorMessage.set(errorMessage);
            this._isSubmitting.set(false);
            this._showSuccessMessage.set(false);
            this.scrollToError();
          }
        });
    } else {
      this._errorMessage.set('Por favor, ingresa un email válido.');
      this.scrollToError();
    }
  }

  //navegacion con NavidagationService
  goBackToLogin(): void {
    this.navigationService.navigateToLogin();
  }

  //Obtie clases diámicas para input
  getInputClasses(field: any): string {
    const baseClasses = 'w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ';

    if (field.invalid && field.touched) {
      return baseClasses + 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50';
    } else if (field.valid && field.touched) {
      return baseClasses + 'border-green-500 focus:border-green-500 focus:ring-green-200 bg-green-50';
    }
    return baseClasses + 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white';
  }

  //Obtien mensjaes de error
  getErrorMessage(fieldName: string): string {
    const field = this.forgotPasswordForm.get(fieldName);
    if (!field?.touched || !field?.errors) return '';

    const errors = field.errors;

    const errorMessage: Record<string, string | (() => string)> = {
      required: 'El campo es requerido',
      email: 'Por favor, ingresa un correo electrónico valido',


    };

    for (const key in errors) {
      const message = errorMessage[key];
      if (message) {
        return typeof message === 'function' ? message() : message
      }
    }
    return 'Campo inválido';
  }


  private scrollToError(): void {
    setTimeout(() => {
      const errorElement = document.querySelector('[aria-live="polite"]');
      if (errorElement) {
        errorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
    }, 100);
  }


  constructor() {
    this.versionService.getVersion().subscribe(data => {
      this.appVersion = data.version
      // console.log('Hola Mundo', this.appVersion);
    })


    // Ocultar mensaje cuando se active el rate limit
    effect(() => {
      if (this.isRateLimited()) {
        this._showSuccessMessage.set(false);
      }
    });
  }


}
