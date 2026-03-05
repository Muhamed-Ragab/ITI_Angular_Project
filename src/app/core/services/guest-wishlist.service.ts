import { Injectable, signal } from '@angular/core';

const GUEST_WISHLIST_KEY = 'guest_wishlist';

@Injectable({ providedIn: 'root' })
export class GuestWishlistService {
  // Store an array of product IDs in the signal
  readonly wishlistItems = signal<string[]>([]);

  constructor() {
    this.loadWishlist();
  }

  private loadWishlist(): void {
    const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (stored) {
      try {
        const items = JSON.parse(stored);
        if (Array.isArray(items)) {
          this.wishlistItems.set(items);
        }
      } catch (e) {
        console.error('Failed to parse guest wishlist from local storage', e);
      }
    }
  }

  private saveWishlist(items: string[]): void {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
    this.wishlistItems.set(items);
  }

  addToWishlist(productId: string): void {
    const items = this.wishlistItems();
    if (!items.includes(productId)) {
      this.saveWishlist([...items, productId]);
    }
  }

  removeFromWishlist(productId: string): void {
    const items = this.wishlistItems();
    this.saveWishlist(items.filter((id) => id !== productId));
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistItems().includes(productId);
  }

  getWishlistItems(): string[] {
    return this.wishlistItems();
  }

  getItemCount(): number {
    return this.wishlistItems().length;
  }

  clearWishlist(): void {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
    this.wishlistItems.set([]);
  }
}
