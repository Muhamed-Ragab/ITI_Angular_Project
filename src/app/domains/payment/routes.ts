import { Routes } from '@angular/router';

export const paymentRoutes: Routes = [
  {
    path: 'success/:orderId',
    loadComponent: () =>
      import('./components/payment-success/payment-success.component').then(
        (m) => m.PaymentSuccessComponent,
      ),
  },
  {
    path: 'failure/:orderId',
    loadComponent: () =>
      import('./components/payment-failure/payment-failure.component').then(
        (m) => m.PaymentFailureComponent,
      ),
  },
];
