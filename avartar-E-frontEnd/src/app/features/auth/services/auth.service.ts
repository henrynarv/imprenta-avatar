import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponse, AuthResponse, AuthState, ForgotPasswordRequest, LoginRequest, PasswordStrength, RegisterRequest, ResetPasswordRequest, SocialLoginRequest, Tokens, User } from '../interfaces/auth-interface';
import { catchError, delay, finalize, map, Observable, of, throwError } from 'rxjs';
import { LoadingService } from '../../../core/services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private router = inject(Router);
  private http = inject(HttpClient);

  private _authState = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });


  // computed properties para acceso reactivo al estado
  authState = computed(() => this._authState());
  currentUser = computed(() => this.authState().user);
  isAuthenticated = computed(() => this._authState().isAuthenticated);
  isLoading = computed(() => this._authState().isLoading);
  error = computed(() => this._authState().error);
  userRole = computed(() => this.authState().user?.role || 'user');
  user = computed(() => this.currentUser());

  // URLs de API (simuladas - reemplazar con endpoints reales)
  // 🔥 VARIABLE PARA SIMULAR/REAL - Cambiar a false cuando esté listo para Spring Boot
  private useMocks = true;

  // URLs de API - Solo cambiar la base cuando migres
  private apiBaseUrl = this.useMocks ? '/api' : 'http://localhost:8080/api';
  private apiUrls = {
    login: `${this.apiBaseUrl}/auth/login`,
    register: `${this.apiBaseUrl}/auth/register`,
    forgotPassword: `${this.apiBaseUrl}/auth/forgot-password`,
    resetPassword: `${this.apiBaseUrl}/auth/reset-password`,
    refreshToken: `${this.apiBaseUrl}/auth/refresh-token`,
    socialLogin: `${this.apiBaseUrl}/auth/social-login`
  };

  constructor() {
    //verificar autenticacion al iniciar el servicio
    this.checkAuthStatus();
  }


  /**
  * Register - Listo para migrar a Spring Boot
  */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    this.setLoadingState(true);
    this.clearError();

    if (this.useMocks) {
      return this.mockRegisterApiCall(userData);
    } else {
      // ✅ LISTO PARA SPRING BOOT
      return this.http.post<AuthResponse>(this.apiUrls.register, userData).pipe(
        map(response => {
          if (response.success && response.data) {
            this.handleSuccessfulAuth(response.data.user, response.data.tokens);
          }
          return response;
        }),
        catchError(error => this.handleHttpError(error))
      );
    }
  }

  /**
 * Obtener token actual - Para el interceptor
 */
  getCurrentToken(): string | null {
    const savedAuth = localStorage.getItem('auth_data');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        return authData.tokens?.accessToken || null;
      } catch {
        return null;
      }
    }
    return null;
  }



  //Slicita el restablecimienot de la contraseña
  forgotPassword(emailData: ForgotPasswordRequest): Observable<ApiResponse<{ message: string }>> {
    this.setLoadingState(true);
    this.clearError();
    return this.mockForgotPasswordApiCall(emailData).pipe(
      map(response => {
        this.setLoadingState(false);
        return response;
      }),
      catchError(error => {
        this.setError(error.message);
        return throwError(() => error);
      })
    )
  }

  // Restablece la contraseña usando un token válido
  resetPassword(resetData: ResetPasswordRequest): Observable<ApiResponse<{ message: string }>> {
    this.setLoadingState(true);
    this.clearError();

    return this.mockResetPasswordApiCall(resetData).pipe(
      map(response => {
        this.setLoadingState(false);
        return response;
      }),
      catchError(error => {
        this.setError(error.message);
        return throwError(() => error);
      })
    )
  }

  /**
   * Valida la fortaleza de una contraseña
   */
  validatePasswordStrength(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;

    // Longitud mínima
    if (password.length >= 6) {
      score += 1;
    } else {
      feedback.push('Mínimo 6 caracteres');
    }

    // Contiene números
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Incluir al menos un número');
    }

    // Contiene mayúsculas
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Incluir al menos una mayúscula');
    }

    // Contiene minúsculas
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Incluir al menos una minúscula');
    }

    // Contiene caracteres especiales
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Incluir al menos un carácter especial');
    }

    return {
      score,
      feedback,
      isValid: score >= 4 // Requiere al menos 4 de 5 criterios
    };
  }



  /**
   * Login - Listo para migrar a Spring Boot
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.setLoadingState(true);
    this.clearError();

    if (this.useMocks) {
      return this.mockLoginApiCall(credentials).pipe(
        map(response => {
          if (response.success && response.data) {
            this.handleSuccessfulAuth(response.data.user, response.data.tokens);
            this.router.navigate(['/home']); // ✅ MOVER aquí dentro de map
          }
          return response;
        })

      );
    } else {
      return this.http.post<AuthResponse>(this.apiUrls.login, credentials).pipe(
        map(response => {
          if (response.success && response.data) {
            this.handleSuccessfulAuth(response.data.user, response.data.tokens);
            this.router.navigate(['/home']);
          }
          return response;
        }),
        catchError(error => this.handleHttpError(error))
      );
    }
  }



  //reaiza login con proveedor social(Google, ect)
  loginWithSocial(socialData: SocialLoginRequest): Observable<AuthResponse> {
    this.setLoadingState(true);
    this.clearError();

    return this.mockSocialLoginApiCall(socialData).pipe(
      map(response => {
        if (response.success && response.data) {
          this.handleSuccessfulAuth(response.data.user, response.data.tokens)
        }
        return response;
      }),
      catchError(error => {
        this.setError(error.message);
        return throwError(() => error);

      })
    )
  }

  // Cierra la sesion del usuario
  logout(): void {
    //limpia el estado actual
    this._authState.set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });

    //limpiar el almacenamineto (simulado)
    localStorage.removeItem("auth_data");
    this.router.navigate(['/auth/login']);
  }


  switchRole(newRole: 'user' | 'admin') {
    const currentState = this._authState();
    if (currentState.user) {
      const updatedUser: User = {
        ...currentState.user,
        role: newRole
      };
      this._authState.set({
        ...currentState,
        user: updatedUser
      })
      this.updateLocalStorage(updatedUser);
    }
  }
  /**
  * Verifica si el usuario tiene un rol específico
  */
  hasRole(role: 'user' | 'admin'): boolean {
    return this.userRole() === role;
  }

  /**
  * Verifica si el usuario está autenticado
  */
  checkAuth(): boolean {
    return this.isAuthenticated();
  }
  //verificar si el usuario esta auttenticado(util para guards)
  checkAuthStatus(): boolean {
    // En implementación real, verificar token en localStorage/API
    const savedAuth = localStorage.getItem('auth_data');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        this._authState.update(state => ({
          ...state,
          user: authData.user,
          isAuthenticated: true
        }));
        return true;
      } catch {
        this.logout();
        return false;
      }
    }
    return false;
  }

  //obtiene el peril del usuario actual
  getProfiel(): Observable<User> {
    return this._mockGetProfileApiCall();
  }

  /**
 * Actualiza el perfil del usuario
 */
  updateProfile(userData: Partial<User>): Observable<{ success: boolean; user: User }> {
    // this._setLoadingState(true);

    return this._mockUpdateProfileApiCall(userData).pipe(
      delay(800)
    );
  }



  //maneja el estado de la carga
  private setLoadingState(isLoading: boolean): void {
    this._authState.update(state => ({ ...state, isLoading }))
  }

  /**
 * Manejo de errores HTTP - Para cuando migres a Spring Boot
 */
  private handleHttpError(error: any): Observable<never> {
    let errorMessage = 'Error de conexión con el servidor';

    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Credenciales inválidas';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para esta acción';
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar al servidor';
    }

    this.setError(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private setError(errorMessage: string): void {
    this._authState.update(state => ({
      ...state,
      error: errorMessage,
      isLoading: false
    }))
  }

  //maneja el estado de carga

  private clearError(): void {
    this._authState.update(state => ({ ...state, error: null }))
  }

  /**
 * Manejar autenticación exitosa
 */
  private handleSuccessfulAuth(user: User, tokens: Tokens): void {
    const authData = { user, tokens };
    localStorage.setItem('auth_data', JSON.stringify(authData));

    this._authState.set({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  }


  // ==========================================================================
  // MÉTODOS DE SIMULACIÓN - REEMPLAZAR CON HTTP CALLS REALES
  // ==========================================================================

  /**
 * Simula una llamada a la API de login
 * TODO: Reemplazar con HttpClient call real
 */
  private mockLoginApiCall(credentials: LoginRequest): Observable<AuthResponse> {
    return of(this.simulateLoginResponse(credentials)).pipe(delay(1500));
  }

  private mockRegisterApiCall(userData: RegisterRequest): Observable<AuthResponse> {
    return of(this.simulateRegisterResponse(userData)).pipe(delay(1500));
  }


  /**
 * Simula una llamada a la API de login
 * TODO: Reemplazar con HttpClient call real
 */
  private mockSocialLoginApiCall(socialData: SocialLoginRequest): Observable<AuthResponse> {
    return of(this.simulateSocialLoginApiCall(socialData)).pipe(delay(1000));
  }

  private mockForgotPasswordApiCall(emailData: ForgotPasswordRequest): Observable<ApiResponse<{ message: string }>> {
    return of(this.simulateForgotPasswordResponse(emailData)).pipe(delay(1000));
  }

  private mockResetPasswordApiCall(resetData: ResetPasswordRequest): Observable<ApiResponse<{ message: string }>> {
    return of(this.simulateResetPasswordResponse(resetData)).pipe(delay(1000));
  }

  private simulateLoginResponse(credentials: LoginRequest): AuthResponse {
    // Validación de credenciales mock
    if (credentials.email === 'user@gmail.com' && credentials.password === '123456') {
      return {
        success: true,
        message: 'Login exitoso',
        data: {
          user: {
            id: 1,
            name: 'Juan Pérez',
            lastName: 'Sanchez',
            email: 'user@gmail.com',
            // email: credentials.email,
            role: 'user',
            phone: '+56 9 1234 5678',
            company: 'Imprenta Creativa S.A.',
            isActive: true,
            createdAt: '2024-01-15',
            updatedAt: '2024-02-15'
          },
          tokens: {
            accessToken: 'mock-jwt-token-angular-dev',
            refreshToken: 'mock-refresh-token-angular-dev',
            expiresIn: 3600
          }
        }
      };
    } else if (credentials.email === 'admin@gmail.com' && credentials.password === '123456') {
      return {
        success: true,
        message: 'Login admin exitoso',
        data: {
          user: {
            id: 2,
            name: 'Administrador',
            lastName: 'Sanchez',
            email: credentials.email,
            role: 'admin',
            isActive: true,
            createdAt: '2024-01-10',
            updatedAt: '2024-02-10'
          },
          tokens: {
            accessToken: 'mock_admin_jwt_token',
            refreshToken: 'mock_admin_refresh_token',
            expiresIn: 3600
          }
        }
      };
    } else {
      throw new Error('Credenciales inválidas. Por favor, verifica tu email y contraseña.');
    }

    // {
    // ✅ CORREGIR: Retornar respuesta con success: false, NO lanzar error
    //   return {
    //     success: false,
    //     message: 'Credenciales inválidas. Por favor, verifica tu email y contraseña.',
    //     // data: null
    //   };
    // }
  }

  private simulateRegisterResponse(userData: RegisterRequest): AuthResponse {
    if (userData.password !== userData.confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: Date.now(),
          name: userData.name,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role === 'admin' ? 'admin' : 'user',
          phone: userData.phone,
          company: userData.company,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        tokens: {
          accessToken: 'mock-jwt-token-new-user',
          refreshToken: 'mock-refresh-token-new-user',
          expiresIn: 3600
        }
      }
    };
  }

  private simulateForgotPasswordResponse(emailData: ForgotPasswordRequest): ApiResponse<{ message: string }> {
    //sumula valdacion email
    if (!emailData.email.includes('@')) {
      throw new Error('Por favor, ingresa un email válido');
    }
    return {
      status: 200,
      message: 'Se ha enviado un enlace de recuperación a tu email',
      data: { message: 'Email de recuperación enviado' },
      timeStamp: new Date().toISOString()
    }
  }

  //genera una respuesta simulada para login social media
  private simulateSocialLoginApiCall(socialData: SocialLoginRequest): AuthResponse {
    return {
      success: true,
      message: `Login con ${socialData.provider} exitoso`,
      data: {
        user: {
          id: 3,
          name: 'usuario google',
          lastName: 'Sanchez',
          email: 'user',
          role: 'user',
          isActive: true,
          createdAt: '2025-01-15',
          updatedAt: '2025-02-15'
        },
        tokens: {
          accessToken: 'mock_jwt_token_here',
          refreshToken: 'mock_refresh_token_here',
          expiresIn: 3600
        }
      }
    }
  }

  /**
   * Simula la obtención del perfil del usuario
   */
  private _mockGetProfileApiCall(): Observable<User> {
    return new Observable(observer => {
      const currentUser = this.currentUser();

      if (currentUser) {
        observer.next(currentUser);
        observer.complete();
      } else {
        observer.error('Usuario no autenticado');
      }
    });
  }

  /**
  * Simula la actualización del perfil
  */
  private _mockUpdateProfileApiCall(userData: Partial<User>): Observable<{ success: boolean; user: User }> {
    return new Observable(observer => {
      const currentState = this._authState();

      if (currentState.user) {
        const updatedUser: User = {
          ...currentState.user,
          ...userData
        };

        this._authState.set({
          ...currentState,
          user: updatedUser
        });

        this.updateLocalStorage(updatedUser);

        observer.next({ success: true, user: updatedUser });
        observer.complete();
      } else {
        this._setError('Usuario no autenticado');
        observer.next({ success: false, user: null! });
        observer.complete();
      }
    });
  }

  /**
  * Maneja errores de autenticación
  */
  private _setError(errorMessage: string): void {
    this._authState.update(state => ({
      ...state,
      error: errorMessage,
      isLoading: false
    }));
  }


  private updateLocalStorage(user: User): void {
    localStorage.setItem('auth_data', JSON.stringify(user));
  }


  private simulateResetPasswordResponse(resetData: ResetPasswordRequest): ApiResponse<{ message: string }> {
    //simula la validacion de token
    if (resetData.token !== 'valid_token') {
      throw new Error('El enlace de recuperación ha expirado o es inválido');
    }

    // Simular validación de contraseñas
    if (resetData.newPassword !== resetData.confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    return {
      status: 200,
      message: 'Contraseña restablecida exitosamente',
      data: { message: 'Contraseña actualizada correctamente' },
      timeStamp: new Date().toISOString()
    };
  }
}
