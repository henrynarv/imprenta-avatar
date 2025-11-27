import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';
import { StorageService } from '../../features/auth/services/storage.service';


/**
 * Interceptor para agregar el token de autenticación a las requests HTTP
 * Excluye rutas públicas que no requieren autenticación
 */

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const storageService = inject(StorageService);

  // obtener el token deñ servicio de autenticación
  const authToken = storageService.getToken();
  const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/refresh-token',
    '/api/public/'
  ];
  const isPublicEndPoint = publicEndpoints.some(endPoint =>
    req.url.includes(endPoint)
  );

  let authReq = req;

  if (authToken && !isPublicEndPoint) {
    console.log('authToken: ', authToken);
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })
  }


  return next(req);
};
