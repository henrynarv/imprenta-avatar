import { Routes } from "@angular/router";
/**
 * Rutas del módulo de reportes
 * Accesibles para usuarios autenticados, con algunas rutas solo para admin
 */
export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full',
  },

  // Reportes de órdenes (accesible para  todos los usuarios atenticados)
  {
    path: 'orders',
    loadComponent: () => import('./pages/order-report/order-report.component').then(m => m.OrderReportComponent),
    title: 'Reporte de Órdenes'
  },

  // Reportes de ventas (solo admin)
  // {
  //   path: 'sales',
  //   loadComponent: () => import('./pages/sales-report/sales-report.component').then(m => m.SalesReportComponent),
  //   canActivate: [RoleGuard],
  //   data: { role: 'admin' },
  //   title: 'Reportes de Ventas'
  // },

  // Reportes de productos (solo admin)
  // {
  //   path: 'products',
  //   loadComponent: () => import('./pages/products-report/products-report.component').then(m => m.ProductsReportComponent),
  //   canActivate: [RoleGuard],
  //   data: { role: 'admin' },
  //   title: 'Reportes de Productos'
  // },

  // // Reportes de clientes (solo admin)
  // {
  //   path: 'customers',
  //   loadComponent: () => import('./pages/customers-report/customers-report.component').then(m => m.CustomersReportComponent),
  //   canActivate: [RoleGuard],
  //   data: { role: 'admin' },
  //   title: 'Reportes de Clientes'
  // }
];

