import { Routes } from '@angular/router';

export const wishlistRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/wishlist-list/wishlist-list.component').then((m) => m.WishlistListComponent),
  },
];
