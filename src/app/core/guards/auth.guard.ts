import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);

  if (authService.isLoading()) {
    return true;
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  return ['/auth/login'];
};
