import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si NO está autenticado → permitir acceso a la ruta pública
  if (!authService.isAuthenticated()) {
    return true;
  }

  // Si está autenticado → redirigir según su rol
  const redirectPath = authService.userRole() === 'admin'
    ? '/admin/dashboard'
    : '/home';

  return router.createUrlTree([redirectPath]);
};
