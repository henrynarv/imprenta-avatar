import { Routes, CanActivateFn } from '@angular/router';
import { authGuard } from './features/auth/guard/auth.guard';
import { roleGuard } from './features/auth/guard/role.guard';

export const routes: Routes = [



  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },

  //pagina de incio publica
  {
    path: 'home',
    loadComponent: () => import('./features/home/page/home-page/home-page.component').then(m => m.HomePageComponent),
    title: 'Inicio'
  },

  //modulo de autenticacion (público)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  //modulo de productos (público)
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES)
  },
  //modulo carrito (requiere autenticación)

  {
    path: 'cart',
    loadComponent: () => import('./features/cart/pages/cart-page/cart-page.component').then(m => m.CartPageComponent),
    canActivate: [authGuard],
    title: 'Carrito de Compras'
  },

  //Módulo de perfil (requiere autenticación)
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/pages/profile-page/profile-page.component').then(m => m.ProfilePageComponent),
    canActivate: [authGuard],
    title: 'Mi Perfil'
  },

  //Módulo  de erfil (requiere autenticación)
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/pages/profile-page/profile-page.component').then(m => m.ProfilePageComponent),
    canActivate: [authGuard],
    title: 'Mi Perfil'
  },

  //Módulo de reportes(requeiere autenticacion)
  {
    path: 'reports',
    loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES),
    canActivate: [authGuard]
  },
  //páginas estaticas publicas
  {
    path: 'about',
    loadComponent: () => import('./features/static/pages/about-page/about-page.component').then(m => m.AboutPageComponent),
    title: 'Sobre Imprenta avatar'
  },

  {
    path: 'contact',
    loadComponent: () => import('./features/static/pages/contact-page/contact-page.component').then(m => m.ContactPageComponent),
    canActivate: [roleGuard],
    data: { role: 'user' },
    title: 'Contacto Imprenta Avatar'
  },

  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent),
    title: 'Dashboard Imprenta Avatar'
  },
  {
    path: 'locations',
    loadComponent: () => import('./features/gestion/pages/locations-page/locations-page.component').then(m => m.LocationsPageComponent),
    title: 'Gestion de tiendas'
  },
  //Ruta 404 - página no encontrada
  {
    path: '**',
    loadComponent: () => import('./features/static/pages/not-found-page/not-found-page.component').then(m => m.NotFoundPageComponent),
    title: 'Página no encontrada'
  }




  /*
    {
      path: '',
      // component: HomeComponent
    },
    {
      path: 'profile',
      // component: ProfileComponent,
      // canActivate: [authGuard]  // Solo requiere estar autenticado (sin roles)
    },
    {
      path: 'admin',
      // component: AdminComponent,
      canActivate: [authGuard],
      data: { roles: ['admin', 'superuser'] } // 👈 Esto se lee con route.data['roles']
    },
    {
      path: 'unauthorized',
      // component: UnauthorizedComponent
    },
    {
      path: '**',
      redirectTo: ''
    }
    */
];
