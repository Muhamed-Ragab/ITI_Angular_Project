import { Routes } from '@angular/router';
import { adminGuard } from '@domains/categories/guards/admin.guard';

export const adminOrderRoutes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/order-list/order-list.component').then(
            (m) => m.AdminOrderListComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/order-detail/order-detail.component').then(
            (m) => m.AdminOrderDetailComponent
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/order-edit/order-edit.component').then(
            (m) => m.AdminOrderEditComponent
          ),
      },
    ],
  },
];
