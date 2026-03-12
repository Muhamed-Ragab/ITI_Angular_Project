import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '@core/services/cart.service';
import { GuestCartService } from '@core/services/guest-cart.service';
import { AuthService } from '@core/services/auth.service';
import { formatCurrency } from '@core/utils';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="container py-4">
      <h2 class="mb-4">{{ 'cart.title' | translate }}</h2>

      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (!hasItems()) {
        <div class="card">
          <div class="card-body text-center py-5">
            <i class="bi bi-cart-x fs-1 text-muted"></i>
            <h4 class="mt-3">{{ 'cart.empty.title' | translate }}</h4>
            <p class="text-muted">{{ 'cart.empty.message' | translate }}</p>
            <a routerLink="/products" class="btn btn-primary">{{
              'cart.empty.startShopping' | translate
            }}</a>
          </div>
        </div>
      } @else {
        <div class="row">
          <!-- Cart Items -->
          <div class="col-lg-8">
            <div class="card mb-3">
              <div class="card-body">
                @for (item of cartItems(); track item.productId) {
                  <div class="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <div class="shrink-0">
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
                    <div class="grow ms-3">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 class="mb-1">{{ item.name }}</h5>
                          <p class="text-muted mb-2">
                            {{ formatCurrency(item.price) }} {{ 'cart.each' | translate }}
                          </p>
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
                <i class="bi bi-arrow-left me-2"></i>{{ 'cart.continueShopping' | translate }}
              </a>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">{{ 'cart.orderSummary' | translate }}</h5>

                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">{{
                    'cart.subtotalItems' | translate: { count: getTotalItems() }
                  }}</span>
                  <span>{{ formatCurrency(subtotal()) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">{{ 'cart.tax' | translate }}</span>
                  <span>{{ formatCurrency(tax()) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">{{ 'cart.shipping' | translate }}</span>
                  <span>{{ formatCurrency(shipping()) }}</span>
                </div>
                <hr />
                <div class="d-flex justify-content-between fw-bold fs-5 mb-4">
                  <span>{{ 'cart.total' | translate }}</span>
                  <span>{{ formatCurrency(total()) }}</span>
                </div>

                <a routerLink="/checkout" class="btn btn-primary w-100">{{
                  'cart.proceedToCheckout' | translate
                }}</a>
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
  private readonly cartService = inject(CartService);
  private readonly guestCartService = inject(GuestCartService);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(true);
  readonly isRemoving = signal(false);
  readonly isUpdating = signal(false);
  
  // Track if user is authenticated
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  
  // Cart data signals
  readonly cartItems = signal<any[]>([]);
  readonly subtotal = signal(0);
  readonly tax = signal(0);
  readonly shipping = signal(0);
  readonly total = signal(0);

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading.set(true);
    
    if (this.authService.isAuthenticated()) {
      // Load server cart for authenticated users
      this.cartService.getCart().subscribe({
        next: (response) => {
          const cart = response.data;
          this.cartItems.set(cart.items);
          this.subtotal.set(cart.subtotal);
          this.tax.set(cart.tax);
          this.shipping.set(cart.shipping);
          this.total.set(cart.total);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
    } else {
      // Load guest cart from localStorage
      this.guestCartService.loadFromStorage();
      const cart = this.guestCartService.cart();
      if (cart) {
        this.cartItems.set(cart.items);
        this.subtotal.set(cart.subtotal);
        this.tax.set(cart.tax);
        this.shipping.set(cart.shipping);
        this.total.set(cart.total);
      }
      this.isLoading.set(false);
    }
  }

  hasItems(): boolean {
    return this.cartItems().length > 0;
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) return;

    this.isUpdating.set(true);
    
    if (this.authService.isAuthenticated()) {
      // Use server cart for authenticated users
      this.cartService.addToCart(productId, quantity).subscribe({
        next: (response) => {
          const cart = response.data;
          this.cartItems.set(cart.items);
          this.subtotal.set(cart.subtotal);
          this.tax.set(cart.tax);
          this.shipping.set(cart.shipping);
          this.total.set(cart.total);
          this.isUpdating.set(false);
        },
        error: () => {
          this.isUpdating.set(false);
        },
      });
    } else {
      // Use guest cart
      this.guestCartService.updateQuantity(productId, quantity);
      const cart = this.guestCartService.cart();
      if (cart) {
        this.cartItems.set([...cart.items]);
        this.subtotal.set(cart.subtotal);
        this.tax.set(cart.tax);
        this.shipping.set(cart.shipping);
        this.total.set(cart.total);
      }
      this.isUpdating.set(false);
    }
  }

  removeItem(productId: any): void {
    console.log('=== Cart removeItem called ===');
    console.log('Received:', productId);
    console.log('Type:', typeof productId);

    // Extract actual string ID
    let actualId: string;
    if (typeof productId === 'string') {
      actualId = productId;
    } else if (typeof productId === 'object' && productId !== null) {
      actualId = productId._id || productId.id || productId.productId || productId.toString();
      console.log('Extracted ID:', actualId);
    } else {
      actualId = String(productId);
    }

    console.log('Final ID:', actualId);

    this.isRemoving.set(true);
    
    if (this.authService.isAuthenticated()) {
      // Use server cart for authenticated users
      this.cartService.removeFromCart(actualId).subscribe({
        next: (response) => {
          const cart = response.data;
          this.cartItems.set(cart.items);
          this.subtotal.set(cart.subtotal);
          this.tax.set(cart.tax);
          this.shipping.set(cart.shipping);
          this.total.set(cart.total);
          this.isRemoving.set(false);
        },
        error: (err) => {
          console.error('Remove error:', err);
          this.isRemoving.set(false);
        },
      });
    } else {
      // Use guest cart
      this.guestCartService.removeItem(actualId);
      const cart = this.guestCartService.cart();
      if (cart) {
        this.cartItems.set([...cart.items]);
        this.subtotal.set(cart.subtotal);
        this.tax.set(cart.tax);
        this.shipping.set(cart.shipping);
        this.total.set(cart.total);
      }
      this.isRemoving.set(false);
    }
  }

  getTotalItems(): number {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  formatCurrency(amount: number): string {
    return formatCurrency(amount);
  }
}
