import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/guest.guard';

export const authRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./components/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./components/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'otp-login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./components/otp-login/otp-login.component').then((m) => m.OtpLoginComponent),
      },
      {
        path: 'verify-email',
        canActivate: [],
        loadComponent: () =>
          import('./components/verify-email/verify-email.component').then(
            (m) => m.VerifyEmailComponent,
          ),
      },
    ],
  },
];
