import { Routes } from "@angular/router";
import { LoginComponent } from './pages/login/login.component';

/**
* Rutas del módulo de autenticación
* Accesibles solo para usuarios NO autenticados
*/
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  //login
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    // canActivate: [PublicGuard],
    title: 'Iniciar Sesión - Imprenta Avatar'
  },
  //Registro
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    // canActivate: [PublicGuard],
    title: 'Registrarse - Imprenta Avatar'
  },
  //recuoeracionde contraseña
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    // canActivate: [PublicGuard],
    title: 'Recuperar contraseña'
  },

  //Restablecder contraseña
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    // canActivate: [PublicGuard],
    title: 'Restablecer contraseña'
  }
]
