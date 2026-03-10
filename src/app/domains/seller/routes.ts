import { Routes } from '@angular/router';

export const sellerRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/seller-dashboard.component').then(m => m.SellerDashboardComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/my-products/seller-products.component').then(m => m.SellerProductsComponent),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./pages/my-orders/seller-orders.component').then(m => m.SellerOrdersComponent),
  },
  {
    path: 'payouts',
    loadComponent: () =>
      import('./pages/payouts/seller-payouts.component').then(m => m.SellerPayoutsComponent),
  },
];