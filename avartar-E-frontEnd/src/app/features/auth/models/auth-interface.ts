//interfaces para el modulo de autenticacion
//preparados para futira integracion con API springboot;

import { UserRole } from "./user-role.enum";


//Interfaces de Request
export interface LoginRequest {
  email: string;
  password: string;
}


export interface RegisterRequest {
  cedula: string
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  address: string;
  comuna: string;
  region: string;

  //Campos opcionlas para la empresa
  businessName?: string
  rut?: string;
  isBusiness?: boolean;
  // role: 'user' | 'admin';
  // aceceptTerms: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  emailSent: boolean,
  email: string,
  nextAttemptAllowed?: string;  // Instant se serializa como string ISO
  remainingTimeSeconds?: number;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ValidateTokenRequest {
  token: string;
}

export interface SocialLoginRequest {
  provider: 'google' | 'facebook';
  token: string
}

//Interfaces Response
export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  fullName: string;
  role: UserRole;
  expiresAt: string;
}

export interface ApiResposnse<T = any> {
  success: boolean,
  message: string,
  timestamp: string
  timestamp_chile?: string;
  data?: T//Genérico para diferentes respuestas
}


export interface User {
  id: number;
  cedula: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  comuna: string;
  region: string;
  businessName?: string;
  rut?: string;
  isBusiness: boolean
  active: boolean
  role: UserRole
  fullName?: string; //campo computado
  createdAt: string;
  updatedAt: string
}



export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean
}

//Para errores de validación de Spring Boot @Valid
export interface ValidationErrorResponse {
  status: number;
  message: string,
  timestamp: string,
  errors: { [key: string]: string[] }
}
