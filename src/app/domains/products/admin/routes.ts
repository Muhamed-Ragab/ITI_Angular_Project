import { Routes } from '@angular/router';
import { adminGuard } from '@domains/categories/guards/admin.guard';

export const adminProductRoutes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/product-list/admin-product-management.component').then(
        (m) => m.AdminProductManagementComponent,
      ),
  },
];