import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { ApiService } from './api.service';
import { CartResponse } from '@domains/cart/dto';

describe('CartService - Type Verification Tests', () => {
  let service: CartService;
  let httpMock: HttpTestingController;
  let apiService: ApiService;

  // Mock actual API response based on console log
  const mockActualApiResponse: CartResponse = {
    success: true,
    data: {
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
      ],
      subtotal: 880,
      tax: 88,
      shipping: 50,
      total: 1018,
    },
  };

  // Alternative possible API response (flat structure)
  const mockFlatApiResponse = {
    success: true,
    data: {
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
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CartService, ApiService],
    });

    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
    apiService = TestBed.inject(ApiService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Type Structure Verification', () => {
    it('should handle nested product_id structure from API', (done) => {
      service.getCart().subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.items.length).toBe(2);

          const firstItem = response.data.items[0];

          // Verify the structure matches DTO
          expect(firstItem.product_id).toBeDefined();
          expect(firstItem.product_id.productId).toBe('69a6f0215a72cce3649aca43');
          expect(firstItem.product_id.name).toBe('Yoga Mat Premium');
          expect(firstItem.product_id.price).toBe(380);
          expect(firstItem.product_id.quantity).toBe(1);
          expect(firstItem.product_id.subtotal).toBe(380);

          // Verify signal is updated
          const cartSignal = service.cart();
          expect(cartSignal).toBeTruthy();
          expect(cartSignal?.items.length).toBe(2);

          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne((request) => request.url.includes('/users/cart'));
      expect(req.request.method).toBe('GET');
      req.flush(mockActualApiResponse);
    });

    it('should identify if API returns flat structure instead', (done) => {
      service.getCart().subscribe({
        next: (response) => {
          const firstItem = response.data.items[0] as any;

          // Check if it's flat structure
          if (firstItem.productId && !firstItem.product_id) {
            console.log('API returns FLAT structure:', firstItem);
            expect(firstItem.productId).toBeDefined();
            expect(firstItem.name).toBeDefined();
          } else if (firstItem.product_id) {
            console.log('API returns NESTED structure:', firstItem);
            expect(firstItem.product_id.productId).toBeDefined();
          }

          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne((request) => request.url.includes('/users/cart'));
      req.flush(mockFlatApiResponse);
    });
  });

  describe('addToCart() - Response Type Verification', () => {
    it('should handle addToCart response with nested structure', (done) => {
      const productId = '69a6f0215a72cce3649aca43';
      const quantity = 2;

      service.addToCart(productId, quantity).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.items.length).toBeGreaterThan(0);

          const item = response.data.items[0];
          console.log('addToCart response item structure:', item);

          // Verify structure
          expect(item.product_id).toBeDefined();
          expect(typeof item.product_id).toBe('object');

          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne((request) => request.url.includes('/users/cart'));
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ product: productId, quantity });
      req.flush(mockActualApiResponse);
    });
  });

  describe('removeFromCart() - Response Type Verification', () => {
    it('should handle removeFromCart with correct product_id extraction', (done) => {
      const productId = '69a6f0215a72cce3649aca43';

      service.removeFromCart(productId).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);

          // Verify the signal is updated correctly
          const cart = service.cart();
          expect(cart).toBeTruthy();

          if (cart && cart.items.length > 0) {
            const item = cart.items[0];
            console.log('Cart item structure after removal:', item);

            // Document the actual structure
            expect(item.product_id).toBeDefined();
          }

          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes(`/users/cart/${productId}`),
      );
      expect(req.request.method).toBe('DELETE');

      // Return cart with one item removed
      const responseAfterRemoval = {
        ...mockActualApiResponse,
        data: {
          ...mockActualApiResponse.data,
          items: [mockActualApiResponse.data.items[1]], // Only second item remains
        },
      };
      req.flush(responseAfterRemoval);
    });

    it('should correctly extract productId for API call', () => {
      // This test verifies what the component should pass to removeFromCart
      const mockCartItem = mockActualApiResponse.data.items[0];

      // Component should extract the ID like this:
      const extractedId = mockCartItem.product_id.productId;

      expect(extractedId).toBe('69a6f0215a72cce3649aca43');
      expect(typeof extractedId).toBe('string');
    });
  });

  describe('Cart Signal State Management', () => {
    it('should maintain correct type in signal after operations', (done) => {
      service.getCart().subscribe({
        next: () => {
          const cart = service.cart();

          expect(cart).toBeTruthy();
          expect(cart?.items).toBeDefined();
          expect(Array.isArray(cart?.items)).toBe(true);

          if (cart && cart.items.length > 0) {
            const item = cart.items[0];

            // Verify the signal maintains the correct structure
            expect(item.product_id).toBeDefined();
            expect(item.product_id.productId).toBeDefined();
            expect(item.product_id.name).toBeDefined();
            expect(item.product_id.price).toBeDefined();
            expect(item.product_id.quantity).toBeDefined();
            expect(item.product_id.subtotal).toBeDefined();
          }

          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne((request) => request.url.includes('/users/cart'));
      req.flush(mockActualApiResponse);
    });
  });

  describe('Type Safety Issues', () => {
    it('should document the type mismatch between DTO and component usage', () => {
      // Current DTO definition expects:
      // item.product_id.productId

      // But component in checkout uses:
      // item.productId (directly)

      // This test documents the issue
      const item = mockActualApiResponse.data.items[0];

      // What DTO says:
      expect(item.product_id.productId).toBeDefined(); // ✓ This works

      // What component tries to access:
      const itemAsAny = item as any;
      expect(itemAsAny.productId).toBeUndefined(); // ✗ This fails - property doesn't exist at this level
    });

    it('should verify cart total calculations work with current structure', (done) => {
      service.getCart().subscribe({
        next: () => {
          const total = service.getCartTotal();
          expect(total).toBe(1018);

          const itemCount = service.getCartItemCount();
          expect(itemCount).toBe(2);

          const isEmpty = service.isEmpty();
          expect(isEmpty).toBe(false);

          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne((request) => request.url.includes('/users/cart'));
      req.flush(mockActualApiResponse);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cart response', (done) => {
      const emptyCartResponse: CartResponse = {
        success: true,
        data: {
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
        },
      };

      service.getCart().subscribe({
        next: (response) => {
          expect(response.data.items.length).toBe(0);
          expect(service.isEmpty()).toBe(true);
          expect(service.getCartTotal()).toBe(0);
          expect(service.getCartItemCount()).toBe(0);

          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne((request) => request.url.includes('/users/cart'));
      req.flush(emptyCartResponse);
    });

    it('should handle cart with missing optional fields', (done) => {
      const cartWithoutImages: CartResponse = {
        success: true,
        data: {
          items: [
            {
              product_id: {
                productId: '69a6f0215a72cce3649aca43',
                name: 'Yoga Mat Premium',
                price: 380,
                quantity: 1,
                subtotal: 380,
                // image is optional
              },
            },
          ],
          subtotal: 380,
          tax: 38,
          shipping: 50,
          total: 468,
        },
      };

      service.getCart().subscribe({
        next: (response) => {
          const item = response.data.items[0];
          expect(item.product_id.image).toBeUndefined();

          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne((request) => request.url.includes('/users/cart'));
      req.flush(cartWithoutImages);
    });
  });
});
