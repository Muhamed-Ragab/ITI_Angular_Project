import { Routes } from '@angular/router';

export const cartRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/cart/cart.component').then((m) => m.CartComponent),
  },
];
