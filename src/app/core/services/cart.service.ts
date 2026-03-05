import { Injectable, inject, signal } from '@angular/core';
import { AddToCartRequest, Cart, CartResponse } from '@domains/cart/dto';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

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
   * @param product_id - Product ID to add
   * @param quantity - Quantity to add
   */
  addToCart(product_id: string, quantity: number = 1): Observable<CartResponse> {
    return this.api
      .put<CartResponse>('/users/cart', { product: product_id, quantity } as AddToCartRequest)
      .pipe(
        tap((response) => {
          this.cart.set(response.data);
        }),
      );
  }

  /**
   * Remove a product from the cart
   * @param product_id - Product ID to remove
   */
  removeFromCart(product_id: string): Observable<CartResponse> {
    console.log('=== CartService.removeFromCart ===');
    console.log('Product ID to remove:', product_id);
    console.log('Product ID type:', typeof product_id);
    console.log('DELETE URL:', `/users/cart/${product_id}`);

    return this.api.delete<CartResponse>(`/users/cart/${product_id}`).pipe(
      tap({
        next: (response) => {
          console.log('Remove successful, response:', response);
          this.cart.set(response.data);
        },
        error: (error) => {
          console.error('Remove failed, error:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.error?.message || error.message);
        },
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
