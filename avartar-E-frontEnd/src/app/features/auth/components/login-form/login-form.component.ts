import { Component, computed, inject, input, output, signal } from '@angular/core';
import { LoginRequest } from '../../interfaces/auth-interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from "@ng-icons/core";
import { heroArrowPath, heroEnvelope, heroExclamationTriangle, heroEye, heroEyeSlash, heroLockClosed } from '@ng-icons/heroicons/outline';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-form',
  imports: [NgIcon, ReactiveFormsModule, RouterLink],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
  providers: [provideIcons({ heroExclamationTriangle, heroEnvelope, heroLockClosed, heroEyeSlash, heroEye })]
})
export class LoginFormComponent {

  private router = inject(Router);
  // Input para configuracion flexible del componet
  isLoading = input<boolean>(false);
  errorMessage = input<string | null>('null');
  showSocialLogin = input<boolean>(true);
  showRegisterLink = input<boolean>(true);
  showForgotPassword = input<boolean>(true);

  // outputs para comunicacion con el componete padre
  loginSubmitted = output<LoginRequest>();
  socialLoginRequested = output<string>();

  private fb = inject(FormBuilder);

  //signal del componente
  private _showPassword = signal<boolean>(false);
  private _isSubmitting = signal<boolean>(false);


  showPassword = computed(() => this._showPassword());
  isFormSubmitting = computed(() => this._isSubmitting() || this.isLoading());

  //formularios reactivos
  loginForm = this.fb.group({
    email: ['user@gmail.com', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  // Obtiene los controles del fomrulario para acceso facil en template
  get formControls() {
    return this.loginForm.controls;
  }

  // alterna la visiblidad de la contraseña
  togglePasswordVisibility(): void {
    this._showPassword.update(value => !value);
  }

  //maneja el envio del formulario
  onSubmit() {
    this.markFormGroupTouched();
    if (this.loginForm.valid) {
      this._isSubmitting.set(true);

      const loginDate: LoginRequest = {
        email: this.loginForm.value.email!.trim(),
        password: this.loginForm.value.password!
      }
      this.loginSubmitted.emit(loginDate);

      // Resetear estado de envío después de un tiempo (simulado)
      setTimeout(() => {
        // this.router.navigate(['/home']);
        this._isSubmitting.set(false);
      }, 2000);
    }
  }


  //maneja el ogin de google
  onGoogleLogin() {
    this.socialLoginRequested.emit('google');
  }

  //marca todos los campos del formulario como touched
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    })
  }

  //Obtiene clases CSS dinámicas para inputs basadas en su estado
  getInputClasses(field: any): string {
    const baseClasses = 'w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ';

    if (field.invalid && field.touched) {
      return baseClasses + 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50';
    } else if (field.valid && field.touched) {
      return baseClasses + 'border-green-500 focus:border-green-500 focus:ring-green-200 bg-green-50';
    }
    return baseClasses + 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white';
  }


  //Obtiene mensaje de error para un campo específico
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (!field?.touched || !field?.errors) return '';

    if (field.errors['required']) {
      return 'El campo es requerido';
    } else if (field.errors['email']) {
      return 'El correo no es valido';
    } else if (field.errors['minlength']) {
      return `La contraseña debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return 'Campo inválido';
  }
}
