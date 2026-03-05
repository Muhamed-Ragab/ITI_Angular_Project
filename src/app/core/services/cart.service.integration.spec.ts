import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { ApiService } from './api.service';
import { environment } from '@env/environment';

/**
 * Integration tests for CartService
 * These tests verify actual API interactions and response handling
 */
describe('CartService - Integration Tests', () => {
  let service: CartService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl || 'http://localhost:3000/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CartService, ApiService],
    });

    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding HTTP requests
  });

  describe('GET /users/cart - Get Cart', () => {
    it('should successfully fetch cart with items', (done) => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              product_id: {
                productId: '69a6f0215a72cce3649aca43',
                name: 'Yoga Mat Premium',
                price: 380,
                quantity: 2,
                subtotal: 760,
                image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
              },
            },
          ],
          subtotal: 760,
          tax: 76,
          shipping: 50,
          total: 886,
        },
      };

      service.getCart().subscribe({
        next: (response) => {
          // Verify response structure
          expect(response.success).toBe(true);
          expect(response.data).toBeDefined();
          expect(response.data.items).toBeDefined();
          expect(Array.isArray(response.data.items)).toBe(true);

          // Verify cart item structure
          const item = response.data.items[0];
          expect(item.product_id).toBeDefined();
          expect(item.product_id.productId).toBe('69a6f0215a72cce3649aca43');
          expect(item.product_id.name).toBe('Yoga Mat Premium');
          expect(item.product_id.price).toBe(380);
          expect(item.product_id.quantity).toBe(2);
          expect(item.product_id.subtotal).toBe(760);

          // Verify cart totals
          expect(response.data.subtotal).toBe(760);
          expect(response.data.tax).toBe(76);
          expect(response.data.shipping).toBe(50);
          expect(response.data.total).toBe(886);

          // Verify signal is updated
          const cart = service.cart();
          expect(cart).toBeTruthy();
          expect(cart?.items.length).toBe(1);
          expect(cart?.total).toBe(886);

          // Verify loading state
          expect(service.isLoading()).toBe(false);

          done();
        },
        error: (error) => {
          done.fail(`Should not error: ${JSON.stringify(error)}`);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/users/cart`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Authorization')).toBe(false); // Will be added by interceptor
      req.flush(mockResponse);
    });

    it('should handle empty cart', (done) => {
      const mockResponse = {
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
          expect(response.success).toBe(true);
          expect(response.data.items.length).toBe(0);
          expect(response.data.total).toBe(0);

          expect(service.isEmpty()).toBe(true);
          expect(service.getCartTotal()).toBe(0);
          expect(service.getCartItemCount()).toBe(0);

          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/users/cart`);
      req.flush(mockResponse);
    });

    it('should handle 401 unauthorized error', (done) => {
      service.getCart().subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(service.isLoading()).toBe(false);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/users/cart`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 404 cart not found', (done) => {
      service.getCart().subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/users/cart`);
      req.flush({ message: 'Cart not found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 server error', (done) => {
      service.getCart().subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/users/cart`);
      req.flush(
        { message: 'Internal server error' },
        { status: 500, statusText: 'Internal Server Error' },
      );
    });
  });

  describe('PUT /users/cart - Add to Cart', () => {
    it('should successfully add item to cart', (done) => {
      const productId = '69a6f0215a72cce3649aca43';
      const quantity = 2;

      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              product_id: {
                productId: productId,
                name: 'Yoga Mat Premium',
                price: 380,
                quantity: quantity,
                subtotal: 760,
                image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
              },
            },
          ],
          subtotal: 760,
          tax: 76,
          shipping: 50,
          total: 886,
        },
      };

      service.addToCart(productId, quantity).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.items.length).toBe(1);

          const item = response.data.items[0];
          expect(item.product_id.productId).toBe(productId);
          expect(item.product_id.quantity).toBe(quantity);

          // Verify signal is updated
          const cart = service.cart();
          expect(cart?.items.length).toBe(1);
          expect(cart?.items[0].product_id.quantity).toBe(quantity);

          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/users/cart`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({
        product: productId,
        quantity: quantity,
      });
      req.flush(mockResponse);
    });

    it('should update quantity if item already exists', (done) => {
      const productId = '69a6f0215a72cce3649aca43';
      const newQuantity = 5;

      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              product_id: {
                productId: productId,
                name: 'Yoga Mat Premium',
                price: 380,
                quantity: newQuantity,
                subtotal: 1900,
                image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
              },
            },
          ],
          subtotal: 1900,
          tax: 190,
          shipping: 50,
          total: 2140,
        },
      };

      service.addToCart(productId, newQuantity).subscribe({
        next: (response) => {
          expect(response.data.items[0].product_id.quantity).toBe(newQuantity);
          expect(response.data.items[0].product_id.subtotal).toBe(1900);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/users/cart`);
      req.flush(mockResponse);
    });

    it('should handle invalid product ID', (done) => {
      const invalidProductId = 'invalid-id';

      service.addToCart(invalidProductId, 1).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/users/cart`);
      req.flush({ message: 'Product not found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should handle out of stock error', (done) => {
      const productId = '69a6f0215a72cce3649aca43';

      service.addToCart(productId, 100).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/users/cart`);
      req.flush(
        { message: 'Insufficient stock' },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    it('should handle negative quantity', (done) => {
      const productId = '69a6f0215a72cce3649aca43';

      service.addToCart(productId, -1).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/users/cart`);
      req.flush(
        { message: 'Quantity must be positive' },
        { status: 400, statusText: 'Bad Request' },
      );
    });
  });

  describe('DELETE /users/cart/:productId - Remove from Cart', () => {
    it('should successfully remove item from cart', (done) => {
      const productId = '69a6f0215a72cce3649aca43';

      const mockResponse = {
        success: true,
        data: {
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
        },
      };

      service.removeFromCart(productId).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.items.length).toBe(0);

          // Verify signal is updated
          const cart = service.cart();
          expect(cart?.items.length).toBe(0);
          expect(service.isEmpty()).toBe(true);

          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/users/cart/${productId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should handle removing non-existent item', (done) => {
      const productId = 'non-existent-id';

      service.removeFromCart(productId).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/users/cart/${productId}`);
      req.flush({ message: 'Item not found in cart' }, { status: 404, statusText: 'Not Found' });
    });

    it('should update cart with remaining items after removal', (done) => {
      const productIdToRemove = '69a6f0215a72cce3649aca43';

      const mockResponse = {
        success: true,
        data: {
          items: [
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
          subtotal: 500,
          tax: 50,
          shipping: 50,
          total: 600,
        },
      };

      service.removeFromCart(productIdToRemove).subscribe({
        next: (response) => {
          expect(response.data.items.length).toBe(1);
          expect(response.data.items[0].product_id.productId).toBe('507f1f77bcf86cd799439011');

          const cart = service.cart();
          expect(cart?.items.length).toBe(1);
          expect(cart?.total).toBe(600);

          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/users/cart/${productIdToRemove}`);
      req.flush(mockResponse);
    });
  });

  describe('Cart State Management', () => {
    it('should maintain cart state across multiple operations', (done) => {
      const productId = '69a6f0215a72cce3649aca43';

      // Step 1: Get cart
      service.getCart().subscribe(() => {
        expect(service.cart()).toBeTruthy();

        // Step 2: Add item
        service.addToCart(productId, 1).subscribe(() => {
          expect(service.cart()?.items.length).toBeGreaterThan(0);

          // Step 3: Remove item
          service.removeFromCart(productId).subscribe(() => {
            expect(service.cart()?.items.length).toBe(0);
            done();
          });

          const removeReq = httpMock.expectOne(`${baseUrl}/users/cart/${productId}`);
          removeReq.flush({
            success: true,
            data: { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 },
          });
        });

        const addReq = httpMock.expectOne(`${baseUrl}/users/cart`);
        addReq.flush({
          success: true,
          data: {
            items: [
              {
                product_id: {
                  productId: productId,
                  name: 'Test Product',
                  price: 100,
                  quantity: 1,
                  subtotal: 100,
                },
              },
            ],
            subtotal: 100,
            tax: 10,
            shipping: 50,
            total: 160,
          },
        });
      });

      const getReq = httpMock.expectOne(`${baseUrl}/users/cart`);
      getReq.flush({
        success: true,
        data: { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 },
      });
    });

    it('should clear cart state', () => {
      // Set initial cart state
      service.cart.set({
        items: [
          {
            product_id: {
              productId: '123',
              name: 'Test',
              price: 100,
              quantity: 1,
              subtotal: 100,
            },
          },
        ],
        subtotal: 100,
        tax: 10,
        shipping: 50,
        total: 160,
      });

      expect(service.cart()).toBeTruthy();

      // Clear cart
      service.clearCart();

      expect(service.cart()).toBeNull();
      expect(service.isEmpty()).toBe(true);
    });
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      service.cart.set({
        items: [
          {
            product_id: {
              productId: '1',
              name: 'Product 1',
              price: 100,
              quantity: 2,
              subtotal: 200,
            },
          },
          {
            product_id: {
              productId: '2',
              name: 'Product 2',
              price: 50,
              quantity: 3,
              subtotal: 150,
            },
          },
        ],
        subtotal: 350,
        tax: 35,
        shipping: 50,
        total: 435,
      });
    });

    it('should calculate cart total correctly', () => {
      expect(service.getCartTotal()).toBe(435);
    });

    it('should count cart items correctly', () => {
      expect(service.getCartItemCount()).toBe(2);
    });

    it('should detect non-empty cart', () => {
      expect(service.isEmpty()).toBe(false);
    });

    it('should detect empty cart', () => {
      service.cart.set(null);
      expect(service.isEmpty()).toBe(true);

      service.cart.set({ items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 });
      expect(service.isEmpty()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', (done) => {
      service.getCart().subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error).toBeDefined();
          expect(service.isLoading()).toBe(false);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/users/cart`);
      req.error(new ProgressEvent('Network error'));
    });

    it('should handle malformed response', (done) => {
      service.getCart().subscribe({
        next: (response) => {
          // Service should still handle it, even if malformed
          expect(response).toBeDefined();
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/users/cart`);
      req.flush({ invalid: 'response' } as any);
    });
  });
});
