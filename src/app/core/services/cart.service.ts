import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Cart, CartResponse, AddToCartRequest } from '@domains/cart/dto';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ApiService);

  // Signal-based state management for cart
  readonly cart = signal<Cart | null>(null);
  readonly isLoading = signal(false);

  /**
   * Get the current user's cart
   */
  getCart(): Observable<CartResponse> {
    this.isLoading.set(true);
    return this.api.get<CartResponse>('/users/cart').pipe(
      tap({
        next: (response) => {
          this.cart.set(response.data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      }),
    );
  }

  /**
   * Add a product to the cart or update quantity if already exists
   * @param productId - Product ID to add
   * @param quantity - Quantity to add
   */
  addToCart(productId: string, quantity: number = 1): Observable<CartResponse> {
    return this.api
      .put<CartResponse>('/users/cart', { productId, quantity } as AddToCartRequest)
      .pipe(
        tap((response) => {
          this.cart.set(response.data);
        }),
      );
  }

  /**
   * Remove a product from the cart
   * @param productId - Product ID to remove
   */
  removeFromCart(productId: string): Observable<CartResponse> {
    return this.api.delete<CartResponse>(`/users/cart/${productId}`).pipe(
      tap((response) => {
        this.cart.set(response.data);
      }),
    );
  }

  /**
   * Get the cart total amount
   */
  getCartTotal(): number {
    return this.cart()?.total ?? 0;
  }

  /**
   * Get the number of items in the cart
   */
  getCartItemCount(): number {
    return this.cart()?.items.length ?? 0;
  }

  /**
   * Check if cart is empty
   */
  isEmpty(): boolean {
    return !this.cart() || this.cart()?.items.length === 0;
  }

  /**
   * Clear the cart state (for logout)
   */
  clearCart(): void {
    this.cart.set(null);
  }
}
