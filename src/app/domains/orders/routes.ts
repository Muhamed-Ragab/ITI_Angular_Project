import { Routes } from '@angular/router';

export const orderRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/order-list/order-list.component').then((m) => m.OrderListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/order-detail/order-detail.component').then(
        (m) => m.OrderDetailComponent,
      ),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/routes').then((m) => m.adminOrderRoutes),
  },
];
