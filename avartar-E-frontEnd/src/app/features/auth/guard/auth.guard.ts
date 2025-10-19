import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1) ¿Está autenticado?
  if (authService.isAuthenticated()) {
    return true;
  }

  // 2) Si no lo está, redirigir al login con returnUrl
  const returnUrl = state.url || '/';
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl }
  });
};
