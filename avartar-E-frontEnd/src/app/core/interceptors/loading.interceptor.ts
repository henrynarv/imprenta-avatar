import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { finalize } from 'rxjs';

/**
 * Interceptor para manejar estados de loading global
 * Muestra/Hide loading spinner durante requests HTTP
 */

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {

  const loadingService = inject(LoadingService);

  // Rutas que NO deben mostrar loading
  const excludeLoading = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/social-login',
    '/auth/refresh-token'
  ];

  const shouldShow = !excludeLoading.some(url => req.url.includes(url));

  // Delay para evitar flicker (150–250ms ideal)
  const DELAY = 200;

  let timeoutId: any;
  let loadingShown = false; //Trackear si se mostró
  if (shouldShow) {

    // Iniciar loader solo si la petición tarda más de DELAY ms
    timeoutId = setTimeout(() => {
      loadingService.show();
      loadingShown = true; //Marcar que se mostró
    }, DELAY);
  }

  return next(req).pipe(
    finalize(() => {

      if (shouldShow) {
        // Cancelar timeout si terminó antes de DELAY
        if (timeoutId) clearTimeout(timeoutId);


        // Solo ocultar si realmente se mostró el loading
        if (loadingShown) {
          loadingService.hide();
        }
      }

    })
  );

};
