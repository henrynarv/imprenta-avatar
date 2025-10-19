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

  // Excluir requests que ni necesitan laoding
  const excludeLoading = [
    '/api/auth/check',
    '/api/analytics',
    '/api/notifications'
  ];

  const shouldShowLoading = !excludeLoading.some(url => req.url.includes(url));
  let loadingTimeout: any;

  if (shouldShowLoading) {
    // Loadin inteligente ; solo muestra si la request tarda mas de 400ms
    loadingTimeout = setTimeout(() => {
      loadingService.show();
    }, 300)
  }

  return next(req).pipe(
    finalize(() => {
      //limpia el timeout y oculta el laoding
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      if (shouldShowLoading) {
        loadingService.hide();
      }
    })
  )
};
