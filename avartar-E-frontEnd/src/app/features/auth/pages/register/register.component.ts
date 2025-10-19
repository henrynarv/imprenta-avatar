import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBuildingOffice, heroCheckCircle, heroEnvelope, heroEye, heroEyeSlash, heroLockClosed, heroPhone, heroUser, heroUserPlus, heroXCircle } from '@ng-icons/heroicons/outline';
import { PasswordStrength, RegisterRequest } from '../../interfaces/auth-interface';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { APP_ASSETS } from '../../../../shared/constants/assets';


@Component({
  selector: 'app-register',
  imports: [NgIcon, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  providers: [
    provideIcons({
      heroEye, heroEyeSlash, heroEnvelope, heroLockClosed,
      heroUser, heroPhone, heroBuildingOffice, heroCheckCircle, heroXCircle, heroUserPlus

    })
  ],
})
export class RegisterComponent {

  logoUrl_gray = APP_ASSETS.LOGO_GRAY;

  // Inyección de servicios
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Signals del componente
  private _showPassword = signal<boolean>(false);
  private _showConfirmPassword = signal<boolean>(false);
  private _isSubmitting = signal<boolean>(false);
  private _passwordStrength = signal<PasswordStrength>({ score: 0, feedback: [], isValid: false });

  // Propiedades computadas
  showPassword = computed(() => this._showPassword());
  showConfirmPassword = computed(() => this._showConfirmPassword());
  isSubmitting = computed(() => this._isSubmitting() || this.authService.isLoading());
  isFormSubmitting = computed(() => this._isSubmitting());
  passwordStrength = computed(() => this._passwordStrength());
  errorMessage = computed(() => this.authService.error());


  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+56\s?9\s?\d{4}\s?\d{4}$/)]],
    company: [''],
    role: ['user', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]]
  }, {
    validators: this.passwordMatchValidator
  });

  // Validador personalizado para coinicdencias de contraseñas
  private passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordsMismatch: true });
      return { passwordMismatch: true }
    }
    return null
  }

  //Obtine los controles del formulario para el acceso facil
  get formControls() {
    return this.registerForm.controls;
  }

  //Alterna la visibilidad de la contraseña principal
  togglePasswordVisibility(): void {
    this._showPassword.update(value => !value);
  }

  //Alterna la visibilidad de la confirmación de contraseña
  toggleConfirmPasswordVisibility(): void {
    this._showConfirmPassword.update(value => !value);
  }


  // maneja el envio del formulario de registro
  onSubmit() {
    this.markFormTouched();

    if (this.registerForm.valid && this.passwordStrength().isValid) {
      const registerData: RegisterRequest = {
        name: this.registerForm.value.name!.trim(),
        lastName: this.registerForm.value.lastName!.trim(),
        email: this.registerForm.value.email!.trim(),
        password: this.registerForm.value.password!,
        confirmPassword: this.registerForm.value.confirmPassword!,
        phone: this.registerForm.value.phone!,
        company: this.registerForm.value.company?.trim(),
        role: this.registerForm.value.role! as 'user' | 'admin',
        aceceptTerms: this.registerForm.value.acceptTerms!,
      };

      this.authService.register(registerData).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              //la redireccion lo maneja en els ervicio
              this._isSubmitting.set(false);
            } else {
              this._isSubmitting.set(false);
            }
          },
          error: (error) => {
            this._isSubmitting.set(false);
          }
        })
    }
  }

  //analiza la fortaleza de la contraseña en tiempo real
  analyzePasswordStrength(): void {
    const password = this.registerForm.get('password')?.value;
    if (password) {
      const strength = this.authService.validatePasswordStrength(password)
      this._passwordStrength.set(strength);
    } else {
      this._passwordStrength.set({ score: 0, feedback: [], isValid: false });
    }
  }

  //Obtine clases CSS dinamicas para inputs
  getInputClasses(field: any): string {
    const baseClasses = 'w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ';

    if (field.invalid && field.touched) {
      return baseClasses + 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50';
    } else if (field.valid && field.touched) {
      return baseClasses + 'border-green-500 focus:border-green-500 focus:ring-green-200 bg-green-50';
    }

    return baseClasses + 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white';
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (!field?.touched || !field?.errors) return '';

    const errors = field.errors;

    const errorMessages: Record<string, string | (() => string)> = {
      required: 'El campo es requerido',
      email: 'Por favor, ingresa un email valido',
      minlength: () => `Mínimo ${errors?.['minlength']?.requiredLength} caracteres`,
      maxlength: () => `Máximo ${errors?.['maxlength']?.requiredLength} caracteres`,
      pattern: () => fieldName === 'phone' ? 'Formato: +56 9 1234 5678' : 'Formato inválido',
      passwordMismatch: 'Las contraseñas no coinciden',
    };
    for (const key in errors) {
      const message = errorMessages[key];
      if (message) {
        return typeof message === 'function' ? message() : message
      }
    }
    return 'Campo inválido';

  }


  // marca todos los campos cmo touched
  private markFormTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAllAsTouched();
    });
  }


  /**
   * Limpia las subscriptions
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
