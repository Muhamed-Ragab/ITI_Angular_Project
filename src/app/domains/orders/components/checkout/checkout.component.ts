import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { UserAddress } from '@app/domains/auth/types';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { GuestCart, GuestCartService } from '@core/services/guest-cart.service';
import { OrderService } from '@core/services/order.service';
import { ProductService } from '@core/services/product.service';
import { formatCurrency } from '@core/utils';
import { CreateOrderRequest, GuestCheckoutRequest } from '@domains/orders/dto';
import { OrdersFacadeService } from '@domains/orders/services/orders-facade.service';
import { PaymentMethod, ValidateCouponResponse } from '@domains/payment/dto';
import { PaymentFacadeService } from '@domains/payment/services/payment-facade.service';

type CheckoutShippingAddressForm = Pick<UserAddress, 'street' | 'city' | 'country' | 'zip'> &
  Partial<Pick<UserAddress, '_id' | 'state' | 'isDefault'>>;

type AuthenticatedOrderPayload = Omit<CreateOrderRequest, 'items'> & {
  shippingAddressIndex: number;
};

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
      } @else if (isLoadingUserData()) {
        <!-- Loading user data for authenticated checkout -->
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading user data...</span>
          </div>
          <p class="mt-3 text-muted">Loading your information...</p>
        </div>
      } @else if (requiresAddress() && !isGuestMode()) {
        <!-- No address available - require user to add one -->
        <div class="alert alert-warning">
          <i class="bi bi-geo-alt me-2"></i>
          <strong>Shipping address required</strong>
          <p class="mb-0 mt-2">
            You need to add a shipping address before proceeding with checkout.
          </p>
        </div>

        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">Add Shipping Address</h5>

            @if (userDataError()) {
              <div class="alert alert-danger">
                {{ userDataError() }}
              </div>
            }

            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Street</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="shippingAddress.street"
                  placeholder="Enter your street address"
                />
              </div>
              <div class="col-md-6">
                <label class="form-label">City</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="shippingAddress.city"
                  placeholder="Enter city"
                />
              </div>
              <div class="col-md-3">
                <label class="form-label">Country</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="shippingAddress.country"
                  placeholder="Enter country"
                />
              </div>
              <div class="col-md-3">
                <label class="form-label">ZIP Code</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="shippingAddress.zip"
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>

            <button
              class="btn btn-primary mt-3"
              (click)="addAddress()"
              [disabled]="isLoadingUserData()"
            >
              @if (isLoadingUserData()) {
                <span class="spinner-border spinner-border-sm me-2"></span>
              }
              Save Address
            </button>
          </div>
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

                @if (userDataError() && !requiresAddress()) {
                  <div class="alert alert-danger mb-3">
                    {{ userDataError() }}
                  </div>
                }

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

                @if (isGuestMode()) {
                  @for (item of guestCart()!.items; track $index) {
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <div class="grow">
                        <div class="fw-medium">{{ item.name }}</div>
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
                      </div>
                      <div class="text-end">{{ formatCurrency(item.price * item.quantity) }}</div>
                    </div>
                  }
                } @else {
                  @for (item of cartService.cart()!.items; track item.productId) {
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <div class="grow">
                        <div class="fw-medium">{{ item.name }}</div>
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
                      </div>
                      <div class="text-end">
                        {{ formatCurrency(item.subtotal) }}
                      </div>
                    </div>
                  }
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
                @if (checkoutError()) {
                  <div class="alert alert-danger mt-3 mb-0">
                    {{ checkoutError() }}
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
  private readonly orderService = inject(OrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Guest mode detection
  readonly isGuestMode = signal(false);
  readonly isLoading = signal(false);
  readonly guestCart = signal<GuestCart | null>(null);

  // User data for authenticated users
  readonly isLoadingUserData = signal(false);
  readonly userDataError = signal<string | null>(null);
  readonly requiresAddress = signal(false);
  readonly checkoutError = signal<string | null>(null);

  // Form signals
  readonly savedAddresses = signal<UserAddress[]>([]);
  readonly selectedAddressIndex = signal<number>(-1);
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
  shippingAddress: CheckoutShippingAddressForm = {
    street: '',
    city: '',
    country: '',
    zip: '',
  };

  // Payment method - Using Stripe for secure payment processing
  // Options: 'stripe' (default), 'wallet', 'cod', 'paypal'
  paymentMethodValue: PaymentMethod = 'stripe';

  shouldShowGuestInfo(): boolean {
    return this.isGuestMode() || !this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.isGuestMode.set(false);
      this.loadUserData();
    } else {
      this.isGuestMode.set(true);
    }

    this.loadCart();
  }

  /**
   * Load authenticated user's profile data and addresses
   * Pre-populates the form and validates address availability
   */
  loadUserData(): void {
    this.isLoadingUserData.set(true);
    this.userDataError.set(null);

    // Get user profile data from AuthService (already loaded)
    const user = this.authService.currentUser();
    if (!user) {
      this.userDataError.set('User data not available. Please log in again.');
      this.isLoadingUserData.set(false);
      return;
    }

    // Fetch user addresses from API
    this.orderService.getUserAddresses().subscribe({
      next: (response) => {
        this.isLoadingUserData.set(false);

        if (response.success && response.data && response.data.length > 0) {
          const validAddresses = response.data.filter(
            (address) => this.orderService.validateShippingAddress(address).isValid,
          );

          if (!validAddresses.length) {
            this.requiresAddress.set(true);
            this.userDataError.set(
              'No complete shipping address found in your profile. Please add a complete address.',
            );
            return;
          }

          // User has saved addresses
          this.savedAddresses.set(validAddresses);
          this.selectedAddressIndex.set(0);

          // Pre-select the default address if available
          const defaultAddress = validAddresses.find((addr) => addr.isDefault);
          if (defaultAddress) {
            const index = validAddresses.indexOf(defaultAddress);
            this.onAddressChange(index);
          } else {
            this.onAddressChange(0);
          }
        } else {
          // No saved addresses - require user to add one
          this.requiresAddress.set(true);
          this.userDataError.set(
            'No shipping address found in your profile. Please add a complete address.',
          );
        }
      },
      error: (err) => {
        this.isLoadingUserData.set(false);
        // If we can't fetch addresses, treat as if user needs to add one
        this.requiresAddress.set(true);
        console.error('Error fetching user addresses:', err);
      },
    });
  }

  /**
   * Add a new shipping address for authenticated user
   */
  addAddress(): void {
    const addr = this.shippingAddress;

    // Validate address fields
    if (!addr.street || !addr.city || !addr.country || !addr.zip) {
      this.userDataError.set('Please fill in all address fields');
      return;
    }

    this.isLoadingUserData.set(true);
    this.userDataError.set(null);

    this.orderService
      .addUserAddress({
        street: addr.street,
        city: addr.city,
        country: addr.country,
        zip: addr.zip,
        isDefault: true,
      })
      .subscribe({
        next: (response) => {
          this.isLoadingUserData.set(false);

          if (response.success && response.data) {
            this.savedAddresses.set(response.data);
            this.requiresAddress.set(false);
            this.selectedAddressIndex.set(response.data.length - 1);
            // Pre-populate from the new address
            if (response.data.length > 0) {
              this.shippingAddress = { ...response.data[0] };
            }
          }
        },
        error: (err) => {
          this.isLoadingUserData.set(false);
          this.userDataError.set(err.error?.message || 'Failed to add address');
        },
      });
  }

  loadCart(): void {
    if (this.isGuestMode()) {
      this.route.queryParams.subscribe((params) => {
        const product_id = params['product_id'];

        if (product_id) {
          this.isLoading.set(true);
          this.productService.getProductById(product_id).subscribe({
            next: (response) => {
              const existingCart = this.guestCartService.getCart();
              if (!existingCart || !existingCart.items.find((i) => i.productId === product_id)) {
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
        next: (response) => {
          console.log('=== CART RESPONSE ===');
          console.log('Full response:', JSON.stringify(response, null, 2));
          console.log('Cart items:', response.data.items);
          if (response.data.items.length > 0) {
            console.log('First item structure:', JSON.stringify(response.data.items[0], null, 2));
          }
        },
        error: () => { },
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
    return this.selectedAddressIndex() >= 0 && this.hasSavedAddresses();
  }

  onAddressChange(index: number): void {
    this.selectedAddressIndex.set(index);
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

  updateQuantity(product_id: string, newQuantity: number): void {
    if (newQuantity < 0) {
      return;
    }

    if (this.isGuestMode()) {
      this.guestCartService.updateQuantity(product_id, newQuantity);
      this.guestCart.set(this.guestCartService.getCart());
    } else {
      this.cartService.addToCart(product_id, newQuantity).subscribe({
        next: (response) => {
          this.cartService.cart.set(response.data);
        },
      });
    }
  }

  removeItem(product_id: any): void {
    console.log('=== removeItem called ===');
    console.log('Received:', product_id);
    console.log('Type:', typeof product_id);

    // Extract actual string ID from whatever structure we receive
    let actualId: string;

    if (typeof product_id === 'string') {
      actualId = product_id;
    } else if (typeof product_id === 'object' && product_id !== null) {
      // Try to extract ID from object
      actualId = product_id._id || product_id.id || product_id.productId || product_id.toString();
      console.log('Extracted ID from object:', actualId);
    } else {
      actualId = String(product_id);
    }

    console.log('Final ID to remove:', actualId);

    if (this.isGuestMode()) {
      this.guestCartService.removeItem(actualId);
      this.guestCart.set(this.guestCartService.getCart());

      // Redirect if cart is empty
      if (!this.guestCartService.hasItems()) {
        this.router.navigate(['/products']);
      }
    } else {
      this.cartService.removeFromCart(actualId).subscribe({
        next: (response) => {
          this.cartService.cart.set(response.data);
          if (!response.data.items.length) {
            this.router.navigate(['/products']);
          }
        },
        error: (error) => {
          console.error('Remove error:', error);
        },
      });
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
    this.checkoutError.set(null);

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
    const addressValidation = this.orderService.validateShippingAddress(this.shippingAddress);

    if (!addressValidation.isValid) {
      const errorMessage =
        'Cannot place order. Your profile shipping address is incomplete: ' +
        addressValidation.missingFields.join(', ');
      this.checkoutError.set(errorMessage);
      this.ordersFacade.error.set(errorMessage);
      return;
    }

    // Use the selected address index (0, 1, 2...) not the address ID
    const addressIndex = this.selectedAddressIndex();

    if (addressIndex < 0) {
      const errorMessage =
        'Cannot place order. Please select a saved shipping address.';
      this.checkoutError.set(errorMessage);
      this.ordersFacade.error.set(errorMessage);
      return;
    }

    const authenticatedCartItems = this.cartService.cart()?.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    }));

    if (!authenticatedCartItems || authenticatedCartItems.length === 0) {
      const errorMessage = 'Cannot place order. Your cart has no valid items.';
      this.checkoutError.set(errorMessage);
      this.ordersFacade.error.set(errorMessage);
      return;
    }

    const normalizedCouponCode = this.couponCodeValue.trim();

    const orderRequest: AuthenticatedOrderPayload = {
      shippingAddressIndex: addressIndex,
      paymentMethod: this.paymentMethodValue,
      ...(normalizedCouponCode ? { couponCode: normalizedCouponCode } : {}),
    };

    this.ordersFacade.createOrder$(orderRequest).subscribe((response) => {
      if (response && response.data) {
        const orderId = response.data.id || (response.data as any)._id;
        this.processPayment(orderId);
      }
    });
  }

  private getNormalizedShippingAddressId(): string | null {
    const selectedAddress =
      this.selectedAddressIndex() >= 0 ? this.savedAddresses()[this.selectedAddressIndex()] : null;

    return this.normalizeAddressId(
      selectedAddress?._id,
      this.shippingAddress._id,
      (this.shippingAddress as unknown as Record<string, unknown>)['id'],
    );
  }

  private normalizeAddressId(...candidates: unknown[]): string | null {
    for (const candidate of candidates) {
      const normalized = this.coerceAddressId(candidate);
      if (normalized !== null) {
        return normalized;
      }
    }

    return null;
  }

  private coerceAddressId(candidate: unknown): string | null {
    if (typeof candidate === 'number' && Number.isFinite(candidate) && candidate > 0) {
      return String(candidate);
    }

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      return trimmed ? trimmed : null;
    }

    if (candidate && typeof candidate === 'object') {
      const objectCandidate = candidate as Record<string, unknown>;
      return this.coerceAddressId(objectCandidate['_id'] ?? objectCandidate['id']);
    }

    return null;
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
      items: cart.items.map((item) => ({
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

        if (response && response.data) {
          const orderId = response.data.id || (response.data as any)._id;
          const guestEmail = (response.data as any).guest_info?.email;
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

    const paymentObservable = useGuestEndpoint
      ? this.paymentFacade.processGuestPayment({
        orderId,
        method: this.paymentMethodValue,
        guestEmail: guestEmail || this.guestInfo.email,
      })
      : this.paymentFacade.processPayment({
        orderId,
        method: this.paymentMethodValue,
      });

    // Subscribe to handle redirect and cleanup - the PaymentFacadeService handles redirect in its tap operator
    paymentObservable.subscribe({
      next: (response) => {
        // Handle redirect - the redirect happens in PaymentFacadeService, but we also handle it here as fallback
        if (response?.success && response?.data?.paymentStatus === 'paid') {
          this.router.navigate(['/payment/success', orderId]);
        }

        // Clean up guest cart after successful payment (only for guest users)
        if (useGuestEndpoint && response?.success) {
          this.clearGuestCart();
        }
      },
      error: (err) => {
        // Error redirect is handled in PaymentFacadeService
        console.error('Payment error:', err);
      },
    });
  }

  /**
   * Clear guest cart data after successful order completion.
   * This only affects guest users and does not touch authenticated user carts.
   */
  private clearGuestCart(): void {
    try {
      // Clear the guest cart from localStorage
      this.guestCartService.clearCart();

      // Reset local state
      this.guestCart.set(null);

      console.log('Guest cart cleared successfully after order completion');
    } catch (error) {
      // Handle any errors gracefully - don't affect the order confirmation
      console.error('Error clearing guest cart:', error);
    }
  }

  formatCurrency(amount: number): string {
    return formatCurrency(amount);
  }
}
