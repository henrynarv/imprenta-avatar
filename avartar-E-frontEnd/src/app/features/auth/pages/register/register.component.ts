import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBuildingOffice, heroCheckCircle, heroEnvelope, heroExclamationTriangle, heroEye, heroEyeSlash, heroIdentification, heroLockClosed, heroMap, heroMapPin, heroPhone, heroUser, heroUserPlus, heroXCircle } from '@ng-icons/heroicons/outline';
import { PasswordStrength, RegisterRequest } from '../../models/auth-interface';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { APP_ASSETS } from '../../../../shared/constants/assets';
import { AuthStateService } from '../../services/auth-state.service';
import { ValidationService } from '../../services/validation.service';
import { StorageService } from '../../services/storage.service';
import { UserMapperService } from '../../services/user-mapper.service';
import { NavigationService } from '../../services/navigation.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { UserRole } from '../../models/user-role.enum';
import { AlertService } from '../../../../shared/service/alert.service';


@Component({
  selector: 'app-register',
  imports: [NgIcon, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  providers: [
    provideIcons({
      heroEye, heroEyeSlash, heroEnvelope, heroLockClosed,
      heroUser, heroPhone, heroBuildingOffice, heroCheckCircle, heroXCircle, heroUserPlus,
      heroMap, heroExclamationTriangle, heroIdentification, heroMapPin

    })
  ],
})
export class RegisterComponent {

  logoUrl_gray = APP_ASSETS.LOGO_GRAY;

  // Exponemos solo los valores necesarios
  userRoleUser = UserRole.ROLE_USER;
  userRoleAdmin = UserRole.ROLE_ADMIN;

  // Inyección de servicios
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private validationService = inject(ValidationService);
  private storageService = inject(StorageService);
  private mapperService = inject(UserMapperService);
  private authStateService = inject(AuthStateService);
  private navigationService = inject(NavigationService);
  private errorhandlerService = inject(ErrorHandlerService);
  private alertService = inject(AlertService);

  private destroy$ = new Subject<void>();

  // Signals del componente
  private _showPassword = signal<boolean>(false);
  private _showConfirmPassword = signal<boolean>(false);
  private _isSubmitting = signal<boolean>(false);
  private _passwordStrength = signal<PasswordStrength>({ score: 0, feedback: [], isValid: false });
  private _errorMessage = signal<string | null>(null);

  // Propiedades computadas
  showPassword = computed(() => this._showPassword());
  showConfirmPassword = computed(() => this._showConfirmPassword());
  isSubmitting = computed(() => this._isSubmitting() || this.authStateService.isLoading());
  isFormSubmitting = computed(() => this._isSubmitting());
  passwordStrength = computed(() => this._passwordStrength());
  errorMessage = computed(() => this._errorMessage());


  registerForm = this.fb.group({
    cedula: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
    firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+56\s?9\s?\d{4}\s?\d{4}$/)]],
    address: ['', Validators.required],
    comuna: ['', Validators.required],
    region: ['', Validators.required],


    //campos opcionales
    businessName: [''],
    rut: [''],
    isBusiness: [false],


    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],

  }, {
    validators: this.passwordMatchValidator
  });

  // Validador personalizado para coinicdencias de contraseñas en tiempo real
  //funciona en el fomrulario  mistras el usuario escribe afecta al FormGroup, status, errors, estados valid/invalid, etc.
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
    this._errorMessage.set(null);


    // Validación frontend primero
    if (!this.registerForm.valid) {
      const firstError = this.getFirstFormError();
      if (firstError) {
        this._errorMessage.set(firstError);
        this.scrollToError();
      }
      return;
    }

    if (!this.passwordStrength().isValid) {
      this._errorMessage.set('La contraseña no cumple con los requisitos de seguridad.');
      this.scrollToError();
      return;
    }

    // if (this.registerForm.valid && this.passwordStrength().isValid) {

    this._isSubmitting.set(true);
    const businessName = this.registerForm.value.businessName?.trim()

    const registerData: RegisterRequest = {
      cedula: this.registerForm.value.cedula?.trim() || '',
      firstName: this.registerForm.value.firstName!.trim(),
      lastName: this.registerForm.value.lastName!.trim(),
      email: this.registerForm.value.email!.trim().toLowerCase(),
      password: this.registerForm.value.password!,
      confirmPassword: this.registerForm.value.confirmPassword!,
      phoneNumber: this.registerForm.value.phoneNumber!,
      address: this.registerForm.value.address!.trim() || '',
      comuna: this.registerForm.value.comuna!.trim() || '',
      region: this.registerForm.value.region?.trim() || '',
      businessName: businessName || undefined,
      rut: this.registerForm.value.rut?.trim() || undefined,
      isBusiness: !!businessName
      // role:this.registerForm.value.role as string,
      // role: this.registerForm.value.role! as 'user' | 'admin',
      // aceceptTerms: this.registerForm.value.acceptTerms!,
      // isBusiness: !!this.registerForm.value.isBusiness
    };

    //validacion del componente osea en el frontend, se valiad antes de enviar al backend
    const validation = this.validationService.validateRegisterData(registerData);
    if (!validation.isValid) {
      this._errorMessage.set(validation.errors[0]);
      this._isSubmitting.set(false);
      this.scrollToError();
      return
    }

    this.authService.register(registerData).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const user = this.mapperService.mapAuthResponseToUser(response);

          this.storageService.saveAuthData({
            user,
            token: response.token,
            tokenType: response.tokenType,
            expiresAt: response.expiresAt
          });

          this.authStateService.setUser(user);

          this._isSubmitting.set(false);
          this.alertService.success("¡Cuenta creada!", " Su registro se completó correctamente.")
          this.navigationService.navigateToHome();

        },
        error: (error) => {
          const errorMessage = this.errorhandlerService.handleAuthError(error);
          this._errorMessage.set(errorMessage);
          this._isSubmitting.set(false);
          this.scrollToError();
        }
      })
    // }

  }

  //Método de scroll reutilizable
  private scrollToError(): void {
    setTimeout(() => {
      const errorElement = document.getElementById('form-error');
      if (errorElement) {
        errorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  }


  //Obtener el primer error del formulario
  private getFirstFormError(): string | null {
    const controls = this.registerForm.controls;

    for (const [key, control] of Object.entries(controls)) {
      if (control.errors && control.touched) {
        return this.getErrorMessage(key);
      }
    }

    return 'Por favor, completa todos los campos requeridos correctamente.';
  }

  //analiza la fortaleza de la contraseña en tiempo real
  analyzePasswordStrength(): void {
    const password = this.registerForm.get('password')?.value;
    if (password) {
      const strength = this.validationService.validationPasswordStrength(password)
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
      pattern: () => fieldName === 'phoneNumber' ? 'Formato: +56 9 1234 5678' : 'Formato inválido',
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

  //Limpia las subscriptions
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
