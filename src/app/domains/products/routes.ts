import { Routes } from '@angular/router';

export const productRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/products-list/product-list.component').then(
        (m) => m.ProductListComponent
      ),
  },
  // ← ADD THIS
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component').then(
        (m) => m.ProductDetailComponent
      ),
  },
];