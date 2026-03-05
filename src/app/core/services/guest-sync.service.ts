import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CartService } from './cart.service';
import { GuestCartService } from './guest-cart.service';
import { GuestWishlistService } from './guest-wishlist.service';
import { WishlistService } from './wishlist.service';

@Injectable({ providedIn: 'root' })
export class GuestSyncService {
  private readonly guestCartService = inject(GuestCartService);
  private readonly guestWishlistService = inject(GuestWishlistService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);

  /**
   * Sync guest cart and wishlist data to the server after login.
   * This is called when a user logs in to transfer their guest data to their account.
   */
  syncGuestData(): Observable<void> {
    // Get guest cart items
    const guestCart = this.guestCartService.getCart();
    const guestWishlistItems = this.guestWishlistService.getWishlistItems();

    const syncOperations: Observable<unknown>[] = [];

    // Sync cart items
    if (guestCart && guestCart.items.length > 0) {
      for (const item of guestCart.items) {
        syncOperations.push(
          this.cartService
            .addToCart(item.productId, item.quantity)
            .pipe(catchError(() => of(null))),
        );
      }
    }

    // Sync wishlist items
    if (guestWishlistItems.length > 0) {
      for (const productId of guestWishlistItems) {
        syncOperations.push(
          this.wishlistService.addToWishlist({ productId }).pipe(catchError(() => of(null))),
        );
      }
    }

    // If no operations, just clear guest data and return
    if (syncOperations.length === 0) {
      this.clearGuestData();
      return of(undefined);
    }

    // Execute all sync operations in parallel
    return new Observable<void>((subscriber) => {
      forkJoin(syncOperations).subscribe({
        next: () => {
          // Clear guest data after successful sync
          this.clearGuestData();
          subscriber.next(undefined);
          subscriber.complete();
        },
        error: (err) => {
          console.error('Error syncing guest data:', err);
          // Still try to clear guest data even on error
          this.clearGuestData();
          subscriber.next(undefined);
          subscriber.complete();
        },
      });
    });
  }

  /**
   * Clear guest cart and wishlist from localStorage.
   * Called after successful sync or when user logs out.
   */
  private clearGuestData(): void {
    this.guestCartService.clearCart();
    this.guestWishlistService.clearWishlist();
  }
}
