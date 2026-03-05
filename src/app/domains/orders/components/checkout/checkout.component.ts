import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { GuestCart, GuestCartService } from '@core/services/guest-cart.service';
import { ProductService } from '@core/services/product.service';
import { formatCurrency } from '@core/utils';
import { CreateOrderRequest, GuestCheckoutRequest } from '@domains/orders/dto';
import { OrdersFacadeService } from '@domains/orders/services/orders-facade.service';
import { PaymentMethod, ValidateCouponResponse } from '@domains/payment/dto';
import { PaymentFacadeService } from '@domains/payment/services/payment-facade.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-4">
      <h2 class="mb-4">{{ isGuestMode() ? 'Guest Checkout' : 'Checkout' }}</h2>

      @if (isGuestMode()) {
        <div class="alert alert-info mb-4">
          <i class="bi bi-info-circle me-2"></i>
          Checking out as guest. <a routerLink="/auth/login">Login</a> to save your information for
          faster checkout.
        </div>
      }

      @if (cartService.isLoading() || isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (!hasCartItems()) {
        <div class="alert alert-warning">
          Your cart is empty. <a routerLink="/products">Continue shopping</a>
        </div>
      } @else {
        <div class="row">
          <div class="col-lg-8">
            <!-- Guest Information (only for guest checkout) -->
            @if (shouldShowGuestInfo()) {
              <div class="card mb-4">
                <div class="card-body">
                  <h5 class="card-title">Contact Information</h5>
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Full Name</label>
                      <input type="text" class="form-control" [(ngModel)]="guestInfo.name" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Email</label>
                      <input type="email" class="form-control" [(ngModel)]="guestInfo.email" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Phone</label>
                      <input type="tel" class="form-control" [(ngModel)]="guestInfo.phone" />
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Shipping Address -->
            <div class="card mb-4">
              <div class="card-body">
                <h5 class="card-title">Shipping Address</h5>
                @if (hasSavedAddresses() && !shouldShowGuestInfo()) {
                  <div class="mb-3">
                    <select
                      class="form-select"
                      [(ngModel)]="selectedAddressIndex"
                      (ngModelChange)="onAddressChange($event)"
                      name="address"
                    >
                      <option [value]="-1">Enter a new address</option>
                      @for (address of savedAddresses(); track $index) {
                        <option [value]="$index">
                          {{ address.street }}, {{ address.city }}, {{ address.country }}
                        </option>
                      }
                    </select>
                  </div>
                }

                @if (!hasSelectedAddress()) {
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Street</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="shippingAddress.street"
                      />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">City</label>
                      <input type="text" class="form-control" [(ngModel)]="shippingAddress.city" />
                    </div>
                    <div class="col-md-3">
                      <label class="form-label">Country</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="shippingAddress.country"
                      />
                    </div>
                    <div class="col-md-3">
                      <label class="form-label">ZIP Code</label>
                      <input type="text" class="form-control" [(ngModel)]="shippingAddress.zip" />
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Coupon Code -->
            <div class="card mb-4">
              <div class="card-body">
                <h5 class="card-title">Coupon Code</h5>
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="couponCodeValue"
                    placeholder="Enter coupon code"
                  />
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    (click)="applyCoupon()"
                    [disabled]="!couponCodeValue || isValidatingCoupon()"
                  >
                    @if (isValidatingCoupon()) {
                      <span class="spinner-border spinner-border-sm"></span>
                    } @else {
                      Apply
                    }
                  </button>
                </div>
                @if (couponMessage()) {
                  <div class="text-success small mt-1">
                    <i class="bi bi-check-circle me-1"></i>{{ couponMessage() }}
                  </div>
                }
                @if (couponError()) {
                  <div class="text-danger small mt-1">
                    <i class="bi bi-exclamation-circle me-1"></i>{{ couponError() }}
                  </div>
                }
                @if (appliedCoupon()) {
                  <div class="text-success small mt-1">
                    <i class="bi bi-check-circle me-1"></i>Coupon applied! {{ getCouponDiscount() }}
                  </div>
                }
              </div>
            </div>

            <!-- Payment Method -->
            <div class="card mb-4">
              <div class="card-body">
                <h5 class="card-title">Payment Method</h5>
                <div class="payment-methods">
                  <div class="form-check mb-2">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      [(ngModel)]="paymentMethodValue"
                    />
                    <label class="form-check-label">
                      <i class="bi bi-credit-card me-2"></i>Credit/Debit Card
                    </label>
                  </div>
                  <div class="form-check mb-2">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      [(ngModel)]="paymentMethodValue"
                    />
                    <label class="form-check-label">
                      <i class="bi bi-paypal me-2"></i>PayPal
                    </label>
                  </div>
                  <div class="form-check mb-2">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      [(ngModel)]="paymentMethodValue"
                    />
                    <label class="form-check-label">
                      <i class="bi bi-cash me-2"></i>Cash on Delivery
                    </label>
                  </div>
                  @if (!shouldShowGuestInfo()) {
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        value="wallet"
                        [(ngModel)]="paymentMethodValue"
                      />
                      <label class="form-check-label">
                        <i class="bi bi-wallet2 me-2"></i>Wallet Balance
                      </label>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Order Summary</h5>

                @for (
                  item of isGuestMode() ? guestCart()!.items : cartService.cart()!.items;
                  track item.productId
                ) {
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="flex-grow-1">
                      <div class="fw-medium">{{ item.name }}</div>
                      @if (isGuestMode()) {
                        <div class="quantity-controls d-flex align-items-center gap-2 mt-1">
                          <button
                            class="btn btn-sm btn-outline-secondary"
                            (click)="updateQuantity(item.productId, item.quantity - 1)"
                            [disabled]="item.quantity <= 1"
                          >
                            <i class="bi bi-dash"></i>
                          </button>
                          <span class="mx-2">{{ item.quantity }}</span>
                          <button
                            class="btn btn-sm btn-outline-secondary"
                            (click)="updateQuantity(item.productId, item.quantity + 1)"
                          >
                            <i class="bi bi-plus"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger ms-2"
                            (click)="removeItem(item.productId)"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      } @else {
                        <small class="text-muted">Qty: {{ item.quantity }}</small>
                      }
                    </div>
                    <div class="text-end">{{ formatCurrency(item.subtotal) }}</div>
                  </div>
                }

                <hr />

                <div class="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>{{
                    formatCurrency(
                      isGuestMode() ? guestCart()!.subtotal : cartService.cart()!.subtotal
                    )
                  }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Tax</span>
                  <span>{{
                    formatCurrency(isGuestMode() ? guestCart()!.tax : cartService.cart()!.tax)
                  }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <span>{{
                    formatCurrency(
                      isGuestMode() ? guestCart()!.shipping : cartService.cart()!.shipping
                    )
                  }}</span>
                </div>
                @if (appliedCoupon()) {
                  <div class="d-flex justify-content-between mb-2 text-success">
                    <span>Discount</span>
                    <span>-{{ formatCurrency(getDiscountAmount()) }}</span>
                  </div>
                }
                <hr />
                <div class="d-flex justify-content-between fw-bold fs-5">
                  <span>Total</span>
                  <span>{{ formatCurrency(getFinalTotal()) }}</span>
                </div>

                <button
                  class="btn btn-primary w-100 mt-4"
                  (click)="placeOrder()"
                  [disabled]="paymentFacade.isProcessing() || !isFormValid()"
                >
                  @if (paymentFacade.isProcessing()) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  } @else {
                    Place Order
                  }
                </button>

                @if (paymentFacade.error()) {
                  <div class="alert alert-danger mt-3 mb-0">
                    {{ paymentFacade.error() }}
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit {
  readonly cartService = inject(CartService);
  readonly guestCartService = inject(GuestCartService);
  readonly paymentFacade = inject(PaymentFacadeService);
  private readonly ordersFacade = inject(OrdersFacadeService);
  private readonly authService = inject(AuthService);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Guest mode detection
  readonly isGuestMode = signal(false);
  readonly isLoading = signal(false);
  readonly guestCart = signal<GuestCart | null>(null);

  // Form signals
  readonly savedAddresses = signal<
    Array<{ street: string; city: string; country: string; zip: string }>
  >([]);
  selectedAddressIndex: number = -1;
  couponCodeValue: string = '';
  readonly couponMessage = signal('');
  readonly couponError = signal('');
  readonly appliedCoupon = signal<ValidateCouponResponse['data'] | null>(null);
  readonly isValidatingCoupon = signal(false);

  // Guest info (for guest checkout)
  guestInfo = {
    name: '',
    email: '',
    phone: '',
  };

  // Shipping address
  shippingAddress = {
    street: '',
    city: '',
    country: '',
    zip: '',
  };

  // Payment method
  paymentMethodValue: PaymentMethod = 'stripe';

  shouldShowGuestInfo(): boolean {
    return this.isGuestMode() || !this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    // Check if this is guest checkout mode
    const url = this.router.url;
    this.isGuestMode.set(url.includes('/guest-checkout'));

    this.loadCart();
  }

  loadCart(): void {
    if (this.isGuestMode()) {
      this.route.queryParams.subscribe((params) => {
        const productId = params['productId'];

        if (productId) {
          this.isLoading.set(true);
          this.productService.getProductById(productId).subscribe({
            next: (response) => {
              const existingCart = this.guestCartService.getCart();
              if (!existingCart || !existingCart.items.find((i) => i.productId === productId)) {
                this.guestCartService.addItem({
                  productId: response.data._id,
                  name: response.data.title,
                  price: response.data.price,
                  quantity: 1,
                  image: response.data.images[0],
                });
              }
              this.guestCart.set(this.guestCartService.getCart());
              this.isLoading.set(false);
            },
            error: () => {
              this.isLoading.set(false);
            },
          });
        } else {
          const guestCart = this.guestCartService.getCart();
          this.guestCart.set(guestCart);
          this.isLoading.set(false);
        }
      });
    } else {
      this.cartService.getCart().subscribe({
        error: () => {},
      });
    }
  }

  hasCartItems(): boolean {
    if (this.isGuestMode()) {
      return this.guestCartService.hasItems();
    }
    const cart = this.cartService.cart();
    return !!(cart && cart.items.length > 0);
  }

  hasSavedAddresses(): boolean {
    return this.savedAddresses().length > 0;
  }

  hasSelectedAddress(): boolean {
    return this.selectedAddressIndex >= 0 && this.hasSavedAddresses();
  }

  onAddressChange(index: number): void {
    this.selectedAddressIndex = index;
    if (index >= 0 && this.savedAddresses().length > 0) {
      const address = this.savedAddresses()[index];
      this.shippingAddress = { ...address };
    }
  }

  applyCoupon(): void {
    if (!this.couponCodeValue) return;

    this.isValidatingCoupon.set(true);
    this.couponError.set('');
    this.couponMessage.set('');

    // Get subtotal (not total) for coupon validation
    const subtotal = this.isGuestMode()
      ? (this.guestCart()?.subtotal ?? 0)
      : (this.cartService.cart()?.subtotal ?? 0);

    this.paymentFacade.validateCoupon(this.couponCodeValue, subtotal).subscribe({
      next: (response) => {
        this.isValidatingCoupon.set(false);
        if (response.success && response.data) {
          this.appliedCoupon.set(response.data);
          // Extract discount amount from any response format
          const discountAmount =
            response.data.coupon_info?.discount_amount ?? response.data.discount_amount ?? 0;
          this.couponMessage.set(`Coupon is valid! You save ${formatCurrency(discountAmount)}`);
        } else {
          this.couponError.set(response.message || 'Invalid coupon code');
        }
      },
      error: (err) => {
        this.isValidatingCoupon.set(false);
        this.couponError.set(err.error?.message || 'Failed to validate coupon');
      },
    });
  }

  /**
   * Extract coupon info from response (handles both API response formats)
   */
  private extractCouponInfo(): {
    type: 'percentage' | 'fixed';
    value: number;
    discountAmount: number;
  } | null {
    const coupon = this.appliedCoupon();
    if (!coupon) return null;

    // New API format: coupon_info with discount_amount
    if (coupon.coupon_info) {
      return {
        type: coupon.coupon_info.type,
        value: coupon.coupon_info.value,
        discountAmount: coupon.coupon_info.discount_amount || coupon.discount_amount || 0,
      };
    }

    // New API format: direct discount_amount with code
    if (coupon.discount_amount !== undefined && coupon.code) {
      return {
        type: 'fixed',
        value: coupon.discount_amount,
        discountAmount: coupon.discount_amount,
      };
    }

    // Legacy format
    if (coupon.discountType && coupon.discountValue !== undefined) {
      const subtotal = this.isGuestMode()
        ? (this.guestCart()?.subtotal ?? 0)
        : (this.cartService.cart()?.subtotal ?? 0);

      const discountAmount =
        coupon.discountType === 'percentage'
          ? (subtotal * coupon.discountValue) / 100
          : coupon.discountValue;

      return {
        type: coupon.discountType,
        value: coupon.discountValue,
        discountAmount,
      };
    }

    return null;
  }

  getCouponDiscount(): string {
    const info = this.extractCouponInfo();
    if (!info) return '';

    if (info.type === 'percentage') {
      return `${info.value}% off`;
    }
    return `${formatCurrency(info.value)} off`;
  }

  getDiscountAmount(): number {
    const info = this.extractCouponInfo();
    return info?.discountAmount ?? 0;
  }

  getFinalTotal(): number {
    let total: number;
    if (this.isGuestMode()) {
      total = this.guestCartService.getCartTotal();
    } else {
      total = this.cartService.getCartTotal();
    }
    return total - this.getDiscountAmount();
  }

  updateQuantity(productId: string, newQuantity: number): void {
    if (this.isGuestMode()) {
      this.guestCartService.updateQuantity(productId, newQuantity);
      this.guestCart.set(this.guestCartService.getCart());
    } else {
      this.cartService.addToCart(productId, newQuantity).subscribe();
    }
  }

  removeItem(productId: string): void {
    if (this.isGuestMode()) {
      this.guestCartService.removeItem(productId);
      this.guestCart.set(this.guestCartService.getCart());

      // Redirect if cart is empty
      if (!this.guestCartService.hasItems()) {
        this.router.navigate(['/products']);
      }
    } else {
      // For authenticated users, remove by setting quantity to 0
      this.cartService.addToCart(productId, 0).subscribe();
    }
  }

  isFormValid(): boolean {
    const addr = this.shippingAddress;
    const hasAddress = !!(addr.street && addr.city && addr.country && addr.zip);

    if (this.isGuestMode()) {
      // Guest needs both contact info and address
      const hasGuestInfo = !!(this.guestInfo.name && this.guestInfo.email && this.guestInfo.phone);
      return hasGuestInfo && hasAddress;
    }

    // Authenticated user just needs address
    return hasAddress;
  }

  placeOrder(): void {
    if (!this.isFormValid()) return;

    const isAuthenticated = this.authService.isAuthenticated();
    const isLoading = this.authService.isLoading();
    console.log('placeOrder - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
    console.log('placeOrder - isGuestMode:', this.isGuestMode());

    if (isLoading) {
      console.log('Auth is still loading, waiting...');
      return;
    }

    const isUnauthenticated = !isAuthenticated;
    if (this.isGuestMode() || isUnauthenticated) {
      this.placeGuestOrder();
    } else {
      this.placeAuthenticatedOrder();
    }
  }

  private placeAuthenticatedOrder(): void {
    const orderRequest: CreateOrderRequest = {
      shippingAddressIndex: this.selectedAddressIndex,
      couponCode: this.appliedCoupon()?.code,
      paymentMethod: this.paymentMethodValue,
    };

    this.ordersFacade.createOrder$(orderRequest).subscribe((response) => {
      if (response && response.data) {
        const orderId = response.data.id || (response.data as any)._id;
        this.processPayment(orderId);
      }
    });
  }

  private placeGuestOrder(): void {
    const cart = this.guestCart();
    if (!cart || cart.items.length === 0) return;

    const guestRequest: GuestCheckoutRequest = {
      guest_info: {
        name: this.guestInfo.name,
        email: this.guestInfo.email,
        phone: this.guestInfo.phone,
      },
      guestEmail: this.guestInfo.email,
      shipping_address: {
        street: this.shippingAddress.street,
        city: this.shippingAddress.city,
        country: this.shippingAddress.country,
        zip: this.shippingAddress.zip,
      },
      items: cart.items.map((item: any) => ({
        product: item.productId,
        quantity: item.quantity,
      })),
      couponCode: this.appliedCoupon()?.code,
      paymentMethod: this.paymentMethodValue,
    };

    this.isLoading.set(true);
    this.ordersFacade.guestCheckout$(guestRequest).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        console.log('=== Guest Checkout Response ===');
        console.log('Full response:', JSON.stringify(response, null, 2));
        console.log('response.data:', response?.data);
        console.log('response.data._id:', response?.data?._id);
        console.log('response.data.user:', response?.data?.user);
        console.log('response.data.guest_info:', response?.data?.guest_info);
        console.log('response.message:', response?.message);

        if (response && response.data) {
          const orderId = response.data.id || (response.data as any)._id;
          const guestEmail = (response.data as any).guest_info?.email;
          console.log('Using Order ID:', orderId);
          console.log('Guest email from order:', guestEmail);
          this.processPayment(orderId, guestEmail);
        }
      },
      error: (err) => {
        console.error('Guest checkout error:', err);
        this.isLoading.set(false);
        this.ordersFacade.error.set(err.error?.message || 'Failed to create order');
      },
    });
  }

  private processPayment(orderId: string, guestEmail?: string): void {
    if (!orderId) {
      console.error('processPayment called with invalid orderId:', orderId);
      this.ordersFacade.error.set('Order ID is missing. Cannot process payment.');
      return;
    }

    console.log('processPayment called with orderId:', orderId);

    const isAuthenticated = this.authService.isAuthenticated();
    const useGuestEndpoint = this.isGuestMode() || !isAuthenticated;

    console.log(
      'processPayment - isAuthenticated:',
      isAuthenticated,
      'useGuestEndpoint:',
      useGuestEndpoint,
    );

    if (useGuestEndpoint) {
      this.paymentFacade
        .processGuestPayment({
          orderId,
          method: this.paymentMethodValue,
          guestEmail: guestEmail || this.guestInfo.email,
        })
        .subscribe();
    } else {
      this.paymentFacade
        .processPayment({
          orderId,
          method: this.paymentMethodValue,
        })
        .subscribe();
    }
  }

  formatCurrency(amount: number): string {
    return formatCurrency(amount);
  }
}
