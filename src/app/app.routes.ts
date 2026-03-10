import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './domains/home/home.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './layouts/admin-layout/admin-dashboard.component';
import { SellerLayoutComponent } from './layouts/seller-layout/seller-layout.component';
import { adminGuard } from './domains/categories/guards/admin.guard';
import { sellerGuard } from './domains/seller/guards/seller.guard';

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

  // Main application routes (customer)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },

      {
        path: 'products',
        loadChildren: () => import('./domains/products/routes').then((m) => m.productRoutes),
      },
      {
        path: 'wishlist',
        canActivate: [authGuard],
        loadChildren: () => import('./domains/wishlist/routes').then((m) => m.wishlistRoutes),
      },
      {
        path: 'cart',
        loadChildren: () => import('./domains/cart/routes').then((m) => m.cartRoutes),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./domains/orders/components/checkout/checkout.component').then(
            (m) => m.CheckoutComponent,
          ),
      },
      {
        path: 'orders',
        loadChildren: () => import('./domains/orders/routes').then((m) => m.orderRoutes),
      },
      {
        path: 'payment',
        loadChildren: () => import('./domains/payment/routes').then((m) => m.paymentRoutes),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./domains/profile/profile-page.component/profile-page.component').then(
            (m) => m.ProfilePageComponent,
          ),
      },
      {
        path: 'seller/payout',
        loadComponent: () =>
          import('./domains/profile/Components/seller-payout-status/seller-payout-status').then(
            (m) => m.SellerPayoutsComponent,
          ),
      },
    ],
  },

  // ── Seller Dashboard ─────────────────────────────────────────────────────────
  {
    path: 'seller',
    component: SellerLayoutComponent,
    canActivate: [authGuard, sellerGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./domains/seller/routes').then((m) => m.sellerRoutes),
      },
    ],
  },

  // ── Admin Dashboard ───────────────────────────────────────────────────────────
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminDashboardComponent },
      {
        path: 'profile',
        loadComponent: () =>
          import('./domains/profile/profile-page.component/profile-page.component').then(
            (m) => m.ProfilePageComponent,
          ),
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./domains/orders/admin/routes').then((m) => m.adminOrderRoutes),
      },
      {
        path: 'coupons',
        loadChildren: () =>
          import('./domains/coupons/admin/routes').then((m) => m.adminCouponRoutes),
      },
      {
        path: 'categories',
        loadChildren: () => import('./domains/categories/routes').then((m) => m.categoryRoutes),
      },
      {
        path: 'sellerrequest',
        loadComponent: () =>
          import('./domains/SellerReview/admin-seller-requests.component/admin-seller-requests.component.ts').then(
            (m) => m.AdminSellerRequestsComponent,
          ),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./domains/products/admin/routes').then((m) => m.adminProductRoutes),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./domains/usermanagment/admin-users-component/admin-users-component').then(
            (m) => m.AdminUsersComponent,
          ),
      },
  
    ],
  },

  {
    path: '**',
    loadComponent: () =>
      import('./shared/pages/not-found.component/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
];