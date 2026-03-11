import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

export const sellerGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.isLoading).pipe(
    filter(isLoading => !isLoading),
    map(() => {
      const user = auth.currentUser();
      if (user?.role === 'seller') return true;
      return router.createUrlTree(['/home']);
    })
  );
};