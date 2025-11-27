import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AuthStateService } from '../../services/auth-state.service';
import { ValidationService } from '../../services/validation.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { NavigationService } from '../../services/navigation.service';
import { AlertService } from '../../../../shared/service/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { VersionService } from '../../../../core/services/version.service';
import { PasswordStrength, ValidateTokenRequest, ApiResposnse, ResetPasswordRequest } from '../../models/auth-interface';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroCheckCircle, heroExclamationTriangle, heroEye, heroEyeSlash, heroLockClosed, heroShieldCheck } from '@ng-icons/heroicons/outline';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-reset-password',
  imports: [NgIcon, ReactiveFormsModule, NgClass],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  providers: [
    provideIcons({
      heroLockClosed, heroArrowLeft, heroCheckCircle,
      heroExclamationTriangle, heroEye, heroEyeSlash, heroShieldCheck
    })
  ],
})
export class ResetPasswordComponent {

  appVersion = ""
  currentYear = new Date().getFullYear();


  //inyeccionde servicios
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private authStateService = inject(AuthStateService);
  private validationService = inject(ValidationService);
  private errorHandlerService = inject(ErrorHandlerService);
  private navigationService = inject(NavigationService);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute)
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private versionService = inject(VersionService);

  //señales del componente
  private _isSubmitting = signal<boolean>(false);
  private _resetSuccess = signal<boolean>(false);
  private _showPassword = signal<boolean>(false);
  private _showConfirmPassword = signal<boolean>(false);
  private _errorMessage = signal<string | null>(null);
  private _tokenValid = signal<boolean>(false);
  private _passwordStrength = signal<PasswordStrength>({ score: 0, feedback: [], isValid: false });

  //computed de propiedaes . integardo con AuthService
  isSubmitting = computed(() => this._isSubmitting() || this.authStateService.isLoading())
  resetSuccess = computed(() => this._resetSuccess())
  showPassword = computed(() => this._showPassword())
  showConfirmPassword = computed(() => this._showConfirmPassword())
  errorMessage = computed(() => this._errorMessage() || this.authStateService.error())
  tokenValid = computed(() => this._tokenValid())
  passwordStrength = computed(() => this._passwordStrength());

  //token desde la URL
  private resetToken: string | null = null;

  ngOnInit(): void {
    this.versionService.getVersion().subscribe(data => {
      this.appVersion = data.version

      // Si ya está abierto en otra pestaña, cerrar esta
      if (window.opener && !window.opener.closed) {
        window.close(); // Cierra la nueva pestaña
        return;
      }
    })


    //Obitne el token de la url
    this.route.queryParamMap.subscribe(params => {
      const token = params.get('token');

      if (token) {
        this.resetToken = token;
        this.validateResetToken(token);//Valida el token al iniciar el componente
      } else {
        //TOKEN NO PROVISTO - REDIRIGIR A FORGOT PASSWORD
        this._errorMessage.set('Enlace de restablecimiento inválido o faltante.');
        setTimeout(() => {
          this.navigationService.navigateToForgotPassword();
        }, 3000);
      }
    })
  }

  //formulario para restet de contraseña
  resetPasswordForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],

  }, {
    validators: this.passwordMatchValidator //Validador personalizado
  });


  //validador personalizado - coincidencia de contraseñas
  private passwordMatchValidator(control: AbstractControl) {
    // const password = control.get("newPassword");
    // const confirmPassword = control.get("confirmPassword");
    // if (password && confirmPassword && password.value !== confirmPassword.value) {
    //   confirmPassword.setErrors({ passwordMismatch: true })
    //   return { passwordMismatch: true };
    // }
    // return null

    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    const pass = password.value;
    const conf = confirmPassword.value;

    // Si falta alguno, limpiamos el error y no validamos
    if (!pass || !conf) {
      confirmPassword.setErrors(null);
      return null;
    }

    // Si no coinciden → asignamos el error sin borrar otros
    if (pass !== conf) {
      confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    }

    // Si coinciden → eliminamos SOLO passwordMismatch
    if (confirmPassword.errors) {
      const { passwordMismatch, ...otherErrors } = confirmPassword.errors;
      confirmPassword.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
    }

    return null;

  }

  //Obtine controles dle formulario para acceso fácil al template
  get formControls() {
    return this.resetPasswordForm.controls;
  }

  togglePasswordVisibility(): void {
    this._showPassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this._showConfirmPassword.update(value => !value);
  }

  //Validar token al cargar el componente
  private validateResetToken(token: string): void {
    this._isSubmitting.set(true);

    const validateData: ValidateTokenRequest = { token };
    //hace lo mismo
    // const validateData : ValidateTokenRequest = {token:token};

    this.authService.validateResetToken(validateData).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResposnse) => {
          this._tokenValid.set(true);
          this._isSubmitting.set(false);
        },
        error: (error) => {
          const errorMessage = this.errorHandlerService.handleAuthError(error);
          this._errorMessage.set(errorMessage);
          this._tokenValid.set(false);
          this._isSubmitting.set(false);
          //redirige si token es invalido
          setTimeout(() => {
            this.navigationService.navigateToForgotPassword();
          }, 5000);
        }
      })
  }

  //analiza fortaleza de la contraseña en tiempo real
  analyzePasswordStrength(): void {
    const password = this.formControls.newPassword.value;
    if (password) {
      const strength = this.validationService.validationPasswordStrength(password);
      this._passwordStrength.set(strength);
    } else {
      this._passwordStrength.set({ score: 0, feedback: [], isValid: false })
    }
  }

  //maneja el restablecimiento de la contraseña
  onSubmit(): void {
    this.resetPasswordForm.markAllAsTouched();
    this._errorMessage.set(null);

    //validaciones previas
    if (!this.resetToken) {
      this._errorMessage.set("Token de restablecimiento no disponible")
      this.scrollToError();
      return;
    }

    if (!this.resetPasswordForm.valid) {
      this._errorMessage.set("Por favor, complete todos los campos");
      this.scrollToError();
      return;
    }

    if (!this.passwordStrength().isValid) {
      this._errorMessage.set("La contraseña no cumple con los requisitos de seguridad.");
      this.scrollToError();
      return;
    }
    this._isSubmitting.set(true);
    //MAPEO DE DATOS COINCIDIENDO CON ResetPasswordRequest DEL BACKEND
    const resetData: ResetPasswordRequest = {
      token: this.resetToken,
      newPassword: this.formControls.newPassword.value!,
      confirmPassword: this.formControls.confirmPassword.value!
    };


    //llamada al servicio y respuesra ApiResponse del Backend
    this.authService.resetPassword(resetData).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResposnse) => {
          this._resetSuccess.set(true);
          this._isSubmitting.set(false);
          this.alertService.success(
            "¡Contraseña actualizada!",
            "Tu contraseña ha sido restablecida exitosamente. Serás redirigido al login"
          );

          setTimeout(() => {
            this.navigationService.navigateToLogin();
          }, 3000);
        },
        error: (error) => {
          const errorMessage = this.errorHandlerService.handleAuthError(error);
          this._errorMessage.set(errorMessage);
          this._isSubmitting.set(false);
          this.scrollToError();
        }
      });
  }

  goBackToLogin(): void {
    this.navigationService.navigateToLogin();
  }

  goToForgotPassword(): void {
    this.navigationService.navigateToForgotPassword();
  }

  //MÉTODO DE SCROLL REUTILIZABLE
  private scrollToError(): void {
    setTimeout(() => {
      const errorElement = document.querySelector('[aria-live="polite"]');
      if (errorElement) {
        errorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  }

  //Obtiene las clases dinamicas para inouts
  getInputClasses(field: any): string {
    const baseClasses = 'w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ';

    if (field.invalid && field.touched) {
      return baseClasses + 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50';
    } else if (field.valid && field.touched) {
      return baseClasses + 'border-green-500 focus:border-green-500 focus:ring-green-200 bg-green-50';
    }

    return baseClasses + 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white';
  }

  //OBTIENE MENSAJES DE ERROR
  getErrorMessage(fieldName: string): string {
    const field = this.resetPasswordForm.get(fieldName);

    if (!field?.touched || !field?.errors) return '';

    const errors = field.errors;

    const errorMessages: Record<string, string | (() => string)> = {
      required: 'El campo es requerido',
      minlength: () => `Mínimo ${errors?.['minlength']?.requiredLength} caracteres`,
      passwordMismatch: 'Las contraseñas no coinciden',
    };

    for (const key in errors) {
      const message = errorMessages[key];
      if (message) {
        return typeof message === 'function' ? message() : message;
      }
    }
    return 'Campo inválido';
  }

  //LIMPIA LAS SUBSCRIPTIONS
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
