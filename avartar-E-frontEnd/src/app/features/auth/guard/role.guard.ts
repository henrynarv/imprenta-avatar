import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStateService } from '../services/auth-state.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  const requiredRole = route.data?.['role'] as string;
  const userRole = authStateService.userRole();

  if (userRole === requiredRole) {
    return true;
  }

  // Redirigir si no tiene permiso
  return router.createUrlTree(['/unauthorized']);
};
