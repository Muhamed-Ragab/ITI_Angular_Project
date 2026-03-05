import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '@core/services/cart.service';
import { formatCurrency } from '@core/utils';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <h2 class="mb-4">Shopping Cart</h2>

      @if (cartService.isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (!hasItems()) {
        <div class="card">
          <div class="card-body text-center py-5">
            <i class="bi bi-cart-x fs-1 text-muted"></i>
            <h4 class="mt-3">Your cart is empty</h4>
            <p class="text-muted">Looks like you haven't added anything to your cart yet.</p>
            <a routerLink="/products" class="btn btn-primary">Start Shopping</a>
          </div>
        </div>
      } @else {
        <div class="row">
          <!-- Cart Items -->
          <div class="col-lg-8">
            <div class="card mb-3">
              <div class="card-body">
                @for (item of cartService.cart()!.items; track item.productId) {
                  <div class="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <div class="flex-shrink-0">
                      @if (item.image) {
                        <img
                          [src]="item.image"
                          [alt]="item.name"
                          class="rounded"
                          style="width: 100px; height: 100px; object-fit: cover;"
                        />
                      } @else {
                        <div
                          class="bg-light rounded d-flex align-items-center justify-content-center"
                          style="width: 100px; height: 100px;"
                        >
                          <i class="bi bi-image text-muted fs-3"></i>
                        </div>
                      }
                    </div>
                    <div class="flex-grow-1 ms-3">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 class="mb-1">{{ item.name }}</h5>
                          <p class="text-muted mb-2">{{ formatCurrency(item.price) }} each</p>
                        </div>
                        <button
                          class="btn btn-sm btn-outline-danger"
                          (click)="removeItem(item.productId)"
                          [disabled]="isRemoving()"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>

                      <div class="d-flex justify-content-between align-items-center">
                        <!-- Quantity Controls -->
                        <div class="quantity-controls">
                          <button
                            class="btn btn-sm btn-outline-secondary"
                            (click)="updateQuantity(item.productId, item.quantity - 1)"
                            [disabled]="item.quantity <= 1 || isUpdating()"
                          >
                            <i class="bi bi-dash"></i>
                          </button>
                          <span class="mx-3">{{ item.quantity }}</span>
                          <button
                            class="btn btn-sm btn-outline-secondary"
                            (click)="updateQuantity(item.productId, item.quantity + 1)"
                            [disabled]="isUpdating()"
                          >
                            <i class="bi bi-plus"></i>
                          </button>
                        </div>

                        <div class="text-end">
                          <div class="fw-bold fs-5">{{ formatCurrency(item.subtotal) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="d-flex justify-content-between">
              <a routerLink="/products" class="btn btn-outline-primary">
                <i class="bi bi-arrow-left me-2"></i>Continue Shopping
              </a>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Order Summary</h5>

                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Subtotal ({{ getTotalItems() }} items)</span>
                  <span>{{ formatCurrency(cartService.cart()!.subtotal) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Tax</span>
                  <span>{{ formatCurrency(cartService.cart()!.tax) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Shipping</span>
                  <span>{{ formatCurrency(cartService.cart()!.shipping) }}</span>
                </div>
                <hr />
                <div class="d-flex justify-content-between fw-bold fs-5 mb-4">
                  <span>Total</span>
                  <span>{{ formatCurrency(cartService.cart()!.total) }}</span>
                </div>

                <a routerLink="/checkout" class="btn btn-primary w-100"> Proceed to Checkout </a>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent implements OnInit {
  readonly cartService = inject(CartService);

  readonly isRemoving = signal(false);
  readonly isUpdating = signal(false);

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.getCart().subscribe({
      error: () => {
        // Cart might be empty or not found - handled gracefully
      },
    });
  }

  hasItems(): boolean {
    const cart = this.cartService.cart();
    return !!(cart && cart.items.length > 0);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) return;

    this.isUpdating.set(true);
    this.cartService.addToCart(productId, quantity).subscribe({
      next: () => {
        this.isUpdating.set(false);
      },
      error: () => {
        this.isUpdating.set(false);
      },
    });
  }

  removeItem(productId: string): void {
    this.isRemoving.set(true);
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        this.isRemoving.set(false);
      },
      error: () => {
        this.isRemoving.set(false);
      },
    });
  }

  getTotalItems(): number {
    const items = this.cartService.cart()?.items;
    if (!items) return 0;
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  formatCurrency(amount: number): string {
    return formatCurrency(amount);
  }
}
