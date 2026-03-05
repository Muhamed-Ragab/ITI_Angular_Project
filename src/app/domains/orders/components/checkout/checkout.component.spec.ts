import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { CheckoutComponent } from './checkout.component';
import { CartService } from '@core/services/cart.service';
import { GuestCartService } from '@core/services/guest-cart.service';
import { AuthService } from '@core/services/auth.service';
import { OrderService } from '@core/services/order.service';
import { PaymentFacadeService } from '@domains/payment/services/payment-facade.service';
import { OrdersFacadeService } from '@domains/orders/services/orders-facade.service';
import { Cart, CartItem } from '@domains/cart/dto';

describe('CheckoutComponent - Type Verification Tests', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let cartService: jasmine.SpyObj<CartService>;
  let guestCartService: jasmine.SpyObj<GuestCartService>;
  let authService: jasmine.SpyObj<AuthService>;

  // Mock cart data matching actual API response structure
  const mockCartWithNestedStructure: Cart = {
    items: [
      {
        product_id: {
          productId: '69a6f0215a72cce3649aca43',
          name: 'Yoga Mat Premium',
          price: 380,
          quantity: 1,
          subtotal: 380,
          image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
        },
      },
      {
        product_id: {
          productId: '507f1f77bcf86cd799439011',
          name: 'Resistance Bands Set',
          price: 250,
          quantity: 2,
          subtotal: 500,
          image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400',
        },
      },
    ] as CartItem[],
    subtotal: 880,
    tax: 88,
    shipping: 50,
    total: 1018,
  };

  beforeEach(async () => {
    const cartServiceSpy = jasmine.createSpyObj('CartService', [
      'getCart',
      'addToCart',
      'removeFromCart',
      'getCartTotal',
      'getCartItemCount',
      'isEmpty',
    ]);
    const guestCartServiceSpy = jasmine.createSpyObj('GuestCartService', [
      'getCart',
      'addItem',
      'removeItem',
      'updateQuantity',
      'hasItems',
      'getCartTotal',
      'clearCart',
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'currentUser']);
    const orderServiceSpy = jasmine.createSpyObj('OrderService', [
      'getUserProfile',
      'getUserAddresses',
      'validateShippingAddress',
      'addUserAddress',
    ]);
    const paymentFacadeSpy = jasmine.createSpyObj('PaymentFacadeService', [
      'processPayment',
      'processGuestPayment',
      'validateCoupon',
    ]);
    const ordersFacadeSpy = jasmine.createSpyObj('OrdersFacadeService', [
      'createOrder$',
      'guestCheckout$',
    ]);

    // Setup default signal values
    cartServiceSpy.cart = signal<Cart | null>(mockCartWithNestedStructure);
    cartServiceSpy.isLoading = signal(false);
    paymentFacadeSpy.isProcessing = signal(false);
    paymentFacadeSpy.error = signal<string | null>(null);
    ordersFacadeSpy.error = signal<string | null>(null);
    authServiceSpy.isLoading = signal(false);

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent, HttpClientTestingModule, RouterTestingModule, FormsModule],
      providers: [
        { provide: CartService, useValue: cartServiceSpy },
        { provide: GuestCartService, useValue: guestCartServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: OrderService, useValue: orderServiceSpy },
        { provide: PaymentFacadeService, useValue: paymentFacadeSpy },
        { provide: OrdersFacadeService, useValue: ordersFacadeSpy },
      ],
    }).compileComponents();

    cartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    guestCartService = TestBed.inject(GuestCartService) as jasmine.SpyObj<GuestCartService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
  });

  describe('Cart Item Structure - Type Verification', () => {
    it('should correctly access nested product_id structure in template', () => {
      authService.isAuthenticated.and.returnValue(false);
      component.isGuestMode.set(false);
      cartService.cart.set(mockCartWithNestedStructure);

      fixture.detectChanges();

      const cart = cartService.cart();
      expect(cart).toBeTruthy();
      expect(cart!.items.length).toBe(2);

      const firstItem = cart!.items[0];

      // Verify the structure matches DTO
      expect(firstItem.product_id).toBeDefined();
      expect(firstItem.product_id.productId).toBe('69a6f0215a72cce3649aca43');
      expect(firstItem.product_id.name).toBe('Yoga Mat Premium');
      expect(firstItem.product_id.price).toBe(380);
    });

    it('should identify type mismatch in removeItem method', () => {
      authService.isAuthenticated.and.returnValue(true);
      component.isGuestMode.set(false);
      cartService.cart.set(mockCartWithNestedStructure);
      cartService.removeFromCart.and.returnValue(
        of({
          success: true,
          data: mockCartWithNestedStructure,
        }),
      );

      const firstItem = mockCartWithNestedStructure.items[0];

      // What the component currently does (INCORRECT):
      // It passes item.productId directly
      // But item.productId doesn't exist at the top level

      // What it SHOULD do:
      const correctProductId = firstItem.product_id.productId;

      // Simulate the component calling removeItem
      component.removeItem(correctProductId);

      // Verify the service was called with the correct ID
      expect(cartService.removeFromCart).toHaveBeenCalledWith(correctProductId);
    });

    it('should document the incorrect property access in template', () => {
      // The template currently uses: item.productId
      // But the actual structure is: item.product_id.productId

      const item = mockCartWithNestedStructure.items[0];

      // What template tries to access:
      const itemAsAny = item as any;
      expect(itemAsAny.productId).toBeUndefined(); // ✗ This property doesn't exist

      // What template SHOULD access:
      expect(item.product_id.productId).toBeDefined(); // ✓ This is the correct path
      expect(item.product_id.name).toBeDefined();
      expect(item.product_id.quantity).toBeDefined();
      expect(item.product_id.subtotal).toBeDefined();
    });
  });

  describe('removeItem() - Type Safety Tests', () => {
    beforeEach(() => {
      authService.isAuthenticated.and.returnValue(true);
      component.isGuestMode.set(false);
      cartService.cart.set(mockCartWithNestedStructure);
    });

    it('should call removeFromCart with correct product ID string', () => {
      cartService.removeFromCart.and.returnValue(
        of({
          success: true,
          data: {
            ...mockCartWithNestedStructure,
            items: [mockCartWithNestedStructure.items[1]],
          },
        }),
      );

      const productId = '69a6f0215a72cce3649aca43';
      component.removeItem(productId);

      expect(cartService.removeFromCart).toHaveBeenCalledWith(productId);
      expect(typeof productId).toBe('string');
    });

    it('should handle removeItem when passed entire item object (current bug)', () => {
      // This test documents the current bug where the component might pass
      // the entire item object instead of just the ID

      const item = mockCartWithNestedStructure.items[0];
      const itemAsAny = item as any;

      // If component passes item.productId (which doesn't exist), it would be undefined
      expect(itemAsAny.productId).toBeUndefined();

      // The correct way to extract the ID:
      const correctId = item.product_id.productId;
      expect(correctId).toBe('69a6f0215a72cce3649aca43');
    });

    it('should verify console.log output matches expected structure', () => {
      // Based on the user's console log, they saw the entire item object
      // This suggests the component is logging the wrong thing

      const item = mockCartWithNestedStructure.items[0];

      // What they logged: product_id
      console.log('Logged product_id:', item.product_id);

      // This shows the entire nested object, not just the ID string
      expect(typeof item.product_id).toBe('object');
      expect(item.product_id.productId).toBe('69a6f0215a72cce3649aca43');
    });
  });

  describe('updateQuantity() - Type Safety Tests', () => {
    beforeEach(() => {
      authService.isAuthenticated.and.returnValue(true);
      component.isGuestMode.set(false);
      cartService.cart.set(mockCartWithNestedStructure);
    });

    it('should call addToCart with correct product ID and quantity', () => {
      cartService.addToCart.and.returnValue(
        of({
          success: true,
          data: mockCartWithNestedStructure,
        }),
      );

      const productId = '69a6f0215a72cce3649aca43';
      const newQuantity = 3;

      component.updateQuantity(productId, newQuantity);

      expect(cartService.addToCart).toHaveBeenCalledWith(productId, newQuantity);
    });

    it('should extract correct product ID from cart item for update', () => {
      const item = mockCartWithNestedStructure.items[0];

      // Correct extraction:
      const productId = item.product_id.productId;

      expect(typeof productId).toBe('string');
      expect(productId).toBe('69a6f0215a72cce3649aca43');
    });
  });

  describe('Template Binding - Type Verification', () => {
    it('should verify correct property paths for template bindings', () => {
      const item = mockCartWithNestedStructure.items[0];

      // Template bindings that should work:
      expect(item.product_id.productId).toBeDefined(); // for track by
      expect(item.product_id.name).toBeDefined(); // for display
      expect(item.product_id.quantity).toBeDefined(); // for quantity display
      expect(item.product_id.subtotal).toBeDefined(); // for price display
      expect(item.product_id.image).toBeDefined(); // for image src

      // Template bindings that WON'T work (current bug):
      const itemAsAny = item as any;
      expect(itemAsAny.productId).toBeUndefined();
      expect(itemAsAny.name).toBeUndefined();
      expect(itemAsAny.quantity).toBeUndefined();
      expect(itemAsAny.subtotal).toBeUndefined();
    });

    it('should document correct template syntax for cart items', () => {
      // Current (INCORRECT) template syntax:
      // @for (item of cartService.cart()!.items; track item.productId)
      //   {{ item.name }}
      //   {{ item.quantity }}

      // Correct template syntax should be:
      // @for (item of cartService.cart()!.items; track item.product_id.productId)
      //   {{ item.product_id.name }}
      //   {{ item.product_id.quantity }}

      const item = mockCartWithNestedStructure.items[0];

      // Verify correct paths:
      expect(item.product_id.productId).toBe('69a6f0215a72cce3649aca43');
      expect(item.product_id.name).toBe('Yoga Mat Premium');
      expect(item.product_id.quantity).toBe(1);
    });
  });

  describe('Guest Cart vs Authenticated Cart - Structure Comparison', () => {
    it('should verify guest cart structure matches authenticated cart', () => {
      const guestCart = {
        items: [
          {
            productId: '69a6f0215a72cce3649aca43',
            name: 'Yoga Mat Premium',
            price: 380,
            quantity: 1,
            subtotal: 380,
            image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
          },
        ],
        subtotal: 380,
        tax: 38,
        shipping: 50,
        total: 468,
      };

      const authenticatedItem = mockCartWithNestedStructure.items[0];
      const guestItem = guestCart.items[0];

      // Guest cart has flat structure
      expect(guestItem.productId).toBeDefined();
      expect(guestItem.name).toBeDefined();

      // Authenticated cart has nested structure
      expect(authenticatedItem.product_id.productId).toBeDefined();
      expect(authenticatedItem.product_id.name).toBeDefined();

      // This inconsistency is a problem!
      console.log('Structure mismatch detected:');
      console.log('Guest cart item:', guestItem);
      console.log('Authenticated cart item:', authenticatedItem);
    });
  });

  describe('Method Parameter Type Verification', () => {
    it('should verify removeItem expects string parameter', () => {
      authService.isAuthenticated.and.returnValue(true);
      component.isGuestMode.set(false);
      cartService.removeFromCart.and.returnValue(
        of({
          success: true,
          data: mockCartWithNestedStructure,
        }),
      );

      // Method signature expects: removeItem(product_id: string)
      const validProductId = '69a6f0215a72cce3649aca43';

      component.removeItem(validProductId);

      expect(cartService.removeFromCart).toHaveBeenCalledWith(validProductId);
      expect(typeof validProductId).toBe('string');
    });

    it('should verify updateQuantity expects string and number parameters', () => {
      authService.isAuthenticated.and.returnValue(true);
      component.isGuestMode.set(false);
      cartService.addToCart.and.returnValue(
        of({
          success: true,
          data: mockCartWithNestedStructure,
        }),
      );

      // Method signature expects: updateQuantity(product_id: string, newQuantity: number)
      const validProductId = '69a6f0215a72cce3649aca43';
      const validQuantity = 2;

      component.updateQuantity(validProductId, validQuantity);

      expect(cartService.addToCart).toHaveBeenCalledWith(validProductId, validQuantity);
      expect(typeof validProductId).toBe('string');
      expect(typeof validQuantity).toBe('number');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle removeFromCart error gracefully', () => {
      authService.isAuthenticated.and.returnValue(true);
      component.isGuestMode.set(false);
      cartService.cart.set(mockCartWithNestedStructure);

      const error = { error: { message: 'Failed to remove item' } };
      cartService.removeFromCart.and.returnValue(throwError(() => error));

      const productId = '69a6f0215a72cce3649aca43';
      component.removeItem(productId);

      expect(cartService.removeFromCart).toHaveBeenCalledWith(productId);
    });

    it('should handle undefined or null cart gracefully', () => {
      authService.isAuthenticated.and.returnValue(true);
      component.isGuestMode.set(false);
      cartService.cart.set(null);

      expect(component.hasCartItems()).toBe(false);
    });
  });
});
