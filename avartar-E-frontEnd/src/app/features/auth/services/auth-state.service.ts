import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthState, User } from '../models/auth-interface';
import { UserRole } from '../models/user-role.enum';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {


  private _authState = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  })

  private storageService = inject(StorageService)


  //computed de señales
  authState = computed(() => this._authState());
  currentUser = computed(() => this._authState().user);
  isAuthenticated = computed(() => this._authState().isAuthenticated)
  isLoading = computed(() => this._authState().isLoading)
  error = computed(() => this._authState().error)
  userRole = computed(() => this._authState().user?.role || UserRole.ROLE_USER)


  //Recupera estado al iniciar la aplicación
  private initializeAuthState(): void {
    const authData = this.storageService.getAuthData();
    //  if (authData?.user && authData?.token) {
    //   // Verificar si el token no ha expirado (si manejas expiración)
    //   const isTokenValid = this.isTokenValid(authData.expiresAt);

    //   if (isTokenValid) {
    //     this.setUser(authData.user);
    //   } else {
    //     // Token expirado, limpiar
    //     this.clearAuth();
    //     this.storageService.removeAuthData();
    //   }
    // }
    if (authData?.user && authData.token) {
      this.setUser(authData.user);
    }


  }


  //Validar expiración del token
  // private isTokenValid(expiresAt?: string): boolean {
  //   if (!expiresAt) return true; // Si no hay expiración, asumir válido

  //   const expirationDate = new Date(expiresAt);
  //   return expirationDate > new Date();
  // }


  setLoading(isLoading: boolean): void {
    this._authState.update(state => ({
      ...state,
      isLoading
    }))
  }

  setError(error: string | null): void {
    this._authState.update(state => ({ ...state, error, isLloading: false }))
  }

  setUser(user: User | null): void {
    this._authState.update(state => ({
      ...state,
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null
    }))
  }

  clearAuth(): void {
    this._authState.set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
  }

  hasRole(role: 'ROLE_USER' | 'ROLE_ADMIN'): boolean {
    return this.userRole() === role;
  }

  //temporal para pruebas


  constructor() {
    this.initializeAuthState();
  }
}
