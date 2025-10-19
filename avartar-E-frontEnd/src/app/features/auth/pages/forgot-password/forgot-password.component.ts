import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroCheckCircle, heroEnvelope, heroLockClosed } from '@ng-icons/heroicons/outline';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ForgotPasswordRequest, ResetPasswordRequest } from '../../interfaces/auth-interface';

@Component({
  selector: 'app-forgot-password',
  imports: [NgIcon, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  providers: [
    provideIcons({
      heroEnvelope, heroLockClosed, heroArrowLeft, heroCheckCircle
    })
  ],
})
export class ForgotPasswordComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);

  //signals del componente
  private _isSubmitting = signal<boolean>(false);
  private _showResetForm = signal<boolean>(false);
  private _emailSent = signal<boolean>(false);
  private _resetSuccess = signal<boolean>(false);


  //computed de la propiedades
  isSubmitting = computed(() => this._isSubmitting() || this.authService.isLoading());
  showResetForm = computed(() => this._showResetForm());
  emailSent = computed(() => this._emailSent());
  resetSuccess = computed(() => this._resetSuccess());
  errorMessage = computed(() => this.authService.error());


  //token de reset desde URL
  private resetToken: string | null = null;

  //Formmlario para solicitar restablecimiento
  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });


  //Formulario para restablecer contraseña
  resetPasswordForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: this.passwordNatchValidator
  })

  constructor() {
    // Verificar si hay un token en la URL(para reset directo)
    this.route.queryParamMap.subscribe(params => {
      const token = params.get('token')
      if (token) {
        this.resetToken = token;
        this._showResetForm.set(true);
      }
    })
  }

  //Validador de coincidencia de contraseñas
  private passwordNatchValidator(control: any) {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true }
    }
    return null
  }

  //Obtiene controles de formularios
  get forgotFormControls() {
    return this.forgotPasswordForm.controls;
  }

  get resetFormControls() {
    return this.resetPasswordForm.controls;
  }




  //Maneja el envío del formulario de solicitud
  onForgotPasswordSubmit(): void {
    this.forgotPasswordForm.markAllAsTouched();

    if (this.forgotPasswordForm.valid) {
      this._isSubmitting.set(true);

      const requestData: ForgotPasswordRequest = {
        email: this.forgotFormControls.email.value!.trim().toLowerCase(),
      };

      this.authService.forgotPassword(requestData).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this._emailSent.set(true);
            this._isSubmitting.set(false);
          },
          error: (error) => {
            this._isSubmitting.set(false);
          }
        })

    }
  }

  //Maneja el restablecimiento de contraseña
  onResetPasswordSubmit(): void {
    this.resetPasswordForm.markAllAsTouched();

    if (this.resetPasswordForm.valid) {
      this._isSubmitting.set(true);
    }

    const resetData: ResetPasswordRequest = {
      token: this.resetToken || 'manual_reset',
      newPassword: this.resetPasswordForm.value.newPassword!,
      confirmPassword: this.resetPasswordForm.value.confirmPassword!
    };
    this.authService.resetPassword(resetData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this._resetSuccess.set(true);
          this._isSubmitting.set(false);

          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
        error: () => {
          this._isSubmitting.set(false);
        }
      });
  }



  //Navega de vuelta al login
  goBackToLogin(): void {
    this.router.navigate(['/auth/login']);
  }



  //Obtiene clases CSS para inputs
  getInputClasses(field: any): string {
    const baseClasses = 'w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ';

    if (field.invalid && field.touched) {
      return baseClasses + 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50';
    } else if (field.valid && field.touched) {
      return baseClasses + 'border-green-500 focus:border-green-500 focus:ring-green-200 bg-green-50';
    }

    return baseClasses + 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white';
  }

  //Obtiene mensajes de error
  getErrorMessage(fieldName: string): string {
    const field = this.resetPasswordForm.get(fieldName);
    if (!field?.touched || !field?.errors) return '';

    const errors = field.errors;

    const errorMessage: Record<string, string | (() => string)> = {
      required: 'El campo es requerido',
      email: 'Por favor, ingresa un correo electrónico valido',
      minlength: () => `Mínimo ${errors?.['minlength']?.requiredLength} caracteres`,
      passwordMismatch: 'Las contraseñas no coinciden',

    };

    for (const key in errors) {
      const message = errorMessage[key];
      if (message) {
        return typeof message === 'function' ? message() : message
      }
    }
    return 'Campo inválido';
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
