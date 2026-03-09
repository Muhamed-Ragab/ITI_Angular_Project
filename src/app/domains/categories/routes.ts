import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

export const categoryRoutes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/category-list/category-management.component').then(
        (m) => m.CategoryManagementComponent,
      ),
  },
];