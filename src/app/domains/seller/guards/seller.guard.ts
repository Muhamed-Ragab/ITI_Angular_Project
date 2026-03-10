import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const sellerGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // Wait for authentication to finish loading before checking role
  // This prevents redirect to /home when auth state is being restored on page reload
  if (auth.isLoading()) {
    return true;
  }

  const user = auth.currentUser();
  if (user?.role === 'seller') return true;

  router.navigate(['/home']);
  return false;
};