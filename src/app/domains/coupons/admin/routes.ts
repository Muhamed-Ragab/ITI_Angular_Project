import { Routes } from '@angular/router';
import { adminGuard } from '@domains/categories/guards/admin.guard';

export const adminCouponRoutes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/coupon-list/coupon-list.component').then(
            (m) => m.AdminCouponListComponent
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./pages/coupon-create/coupon-create.component').then(
            (m) => m.AdminCouponCreateComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/coupon-detail/coupon-detail.component').then(
            (m) => m.AdminCouponDetailComponent
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/coupon-edit/coupon-edit.component').then(
            (m) => m.AdminCouponEditComponent
          ),
      },
    ],
  },
];
