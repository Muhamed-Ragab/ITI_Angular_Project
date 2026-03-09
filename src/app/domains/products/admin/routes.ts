import { Routes } from '@angular/router';

export const adminProductRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/product-list/admin-product-management.component').then(
        (m) => m.AdminProductManagementComponent,
      ),
  },
];