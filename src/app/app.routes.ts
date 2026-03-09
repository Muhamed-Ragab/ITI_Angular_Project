import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './domains/home/home.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './layouts/admin-layout/admin-dashboard.component';
import { adminGuard } from './domains/categories/guards/admin.guard';

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

  // Main application routes with auth guard
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

      // Profile
      {
        path: 'profile',
        loadComponent: () =>
          import('./domains/profile/profile-page.component/profile-page.component').then(
            (m) => m.ProfilePageComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path:'seller/payout',
        loadComponent:()=>
          import('./domains/profile/Components/seller-payout-status/seller-payout-status').then((m)=>m.SellerPayoutsComponent),
      },
    ],
  },

  // Standalone admin routes with their own layout
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        component: AdminDashboardComponent,
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
          import('./domains/usermanagment/admin-users-component/admin-users-component').then((m) => m.AdminUsersComponent),
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
