import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './domains/home/home.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import('./domains/auth/routes').then((m) => m.authRoutes),
  },

  // Guest checkout - public, no auth required
  {
    path: 'guest-checkout',
    loadComponent: () =>
      import('./domains/orders/components/checkout/checkout.component').then(
        (m) => m.CheckoutComponent,
      ),
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },

      // Products
      {
        path: 'products',
        loadChildren: () => import('./domains/products/routes').then((m) => m.productRoutes),
      },

      // Wishlist
      {
        path: 'wishlist',
        canActivate: [authGuard],
        loadChildren: () => import('./domains/wishlist/routes').then((m) => m.wishlistRoutes),
      },

      // Cart
      {
        path: 'cart',
        loadChildren: () => import('./domains/cart/routes').then((m) => m.cartRoutes),
      },

      // Checkout - authenticated users only (protected by parent authGuard)
      {
        path: 'checkout',
        loadComponent: () =>
          import('./domains/orders/components/checkout/checkout.component').then(
            (m) => m.CheckoutComponent,
          ),
      },

      // Orders
      {
        path: 'orders',
        loadChildren: () => import('./domains/orders/routes').then((m) => m.orderRoutes),
      },

      // Payment
      {
        path: 'payment',
        loadChildren: () => import('./domains/payment/routes').then((m) => m.paymentRoutes),
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
