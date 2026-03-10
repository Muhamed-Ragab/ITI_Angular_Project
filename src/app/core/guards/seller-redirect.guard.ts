import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const sellerRedirectGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // Wait for authentication to finish loading
  if (auth.isLoading()) {
    // If still loading, allow the route to proceed and let the auth guard handle it
    return true;
  }

  // If user is not authenticated, let them proceed to the main routes
  // (they will be redirected to login by the auth guard)
  if (!auth.isAuthenticated()) {
    return true;
  }

  // If user is authenticated and is a seller, redirect to seller dashboard
  const user = auth.currentUser();
  if (user?.role === 'seller') {
    router.navigate(['/seller']);
    return false;
  }

  // If user is authenticated but not a seller (customer), proceed to main routes
  return true;
};
