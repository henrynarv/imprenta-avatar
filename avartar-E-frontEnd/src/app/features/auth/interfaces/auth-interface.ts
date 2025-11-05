//interfaces para el modulo de autenticacion
//preparados para futira integracion con API springboot;


//Interfaces de Request
export interface LoginRequest {
  email: string;
  password: string;
}


export interface RegisterRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  company?: string
  role: 'user' | 'admin';
  aceceptTerms: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SocialLoginRequest {
  provider: 'google' | 'facebook';
  token: string
}

//Interfaces Response
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    tokens: Tokens;
  }
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timeStamp: string;
}

export interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  phone?: string;
  company?: string;
  isActive: boolean
  createdAt: string;
  updatedAt: string
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
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
