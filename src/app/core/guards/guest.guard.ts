import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const guestGuard = () => {
  const authService = inject(AuthService);

  // If still loading user profile, allow navigation
  if (authService.isLoading()) {
    return true;
  }

  // If not authenticated, allow access to auth pages
  if (!authService.isAuthenticated()) {
    return true;
  }

  // Already authenticated, redirect to home
  return ['/home'];
};
