import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { GoogleMapsModule } from '@angular/google-maps';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(), // Habilita Input Binding para route params
      withViewTransitions({
        skipInitialTransition: true // ✅ Esto ayuda con el efecto
      }), // Habilita transiciones de vista nativas

    ),
    provideHttpClient(
      withInterceptors([
        authInterceptor,     // Interceptor para agregar tokens de autenticación
        loadingInterceptor   // Interceptor para manejar estados de loading
      ])
    ),
    importProvidersFrom(GoogleMapsModule),
    provideCharts(withDefaultRegisterables())
    //brouser animations

  ]
};
