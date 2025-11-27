import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResposnse, AuthResponse, AuthState, ForgotPasswordRequest, LoginRequest, PasswordStrength, RegisterRequest, ResetPasswordRequest, SocialLoginRequest, User, ValidateTokenRequest } from '../models/auth-interface';
import { catchError, delay, finalize, map, Observable, of, throwError } from 'rxjs';
import { LoadingService } from '../../../core/services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private apiBaseUrl: string = 'http://localhost:8080/api';

  private endpoints = {
    login: `${this.apiBaseUrl}/auth/login`,
    register: `${this.apiBaseUrl}/auth/register`,
    forgotPassword: `${this.apiBaseUrl}/auth/forgot-password`,
    resetPassword: `${this.apiBaseUrl}/auth/reset-password`,
    validateResetToken: `${this.apiBaseUrl}/auth/validate-reset-token`,
    refreshToken: `${this.apiBaseUrl}/auth/refresh-token`,
    socialLogin: `${this.apiBaseUrl}/auth/social-login`
  };

  //SOLO LLAMADAS HTTP  - SIN LOGICA DE NEGOCIO
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.endpoints.register, userData)
  }

  login(userData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.endpoints.login, userData);
  }


  forgotPassword(emailData: ForgotPasswordRequest): Observable<ApiResposnse> {
    return this.http.post<ApiResposnse>(this.endpoints.forgotPassword, emailData);
  }

  resetPassword(resetData: ResetPasswordRequest): Observable<ApiResposnse> {
    return this.http.post<ApiResposnse>(this.endpoints.resetPassword, resetData);
  }

  validateResetToken(validateData: ValidateTokenRequest): Observable<ApiResposnse> {
    return this.http.post<ApiResposnse>(this.endpoints.validateResetToken, validateData);
  }



  socialLogin(socialDate: SocialLoginRequest): Observable<any> {
    return this.http.post<any>(this.endpoints.socialLogin, socialDate);
  }

}
