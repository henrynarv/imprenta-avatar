import { Routes } from "@angular/router";
/**
 * Rutas del módulo de productos
 * Accesibles para todos los usuarios (públicas)
 */
export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./page/product-list-page/product-list-page.component').then(m => m.ProductListPageComponent),
    title: 'Catálogo de productos'
  },

  // detalle de producto
  {
    path: ':id',
    loadComponent: () => import('./page/product-detail-page/product-detail-page.component').then(m => m.ProductDetailPageComponent),
    title: 'Detalle de producto'
  },

  //categoria de productos
  {
    path: 'category/:category',
    loadComponent: () => import('./page/product-list-page/product-list-page.component').then(m => m.ProductListPageComponent),
    title: 'categoria'
  },

  //bisqueda de productos
  {
    path: 'search',
    loadComponent: () => import('./page/product-list-page/product-list-page.component').then(m => m.ProductListPageComponent),
  }
]
