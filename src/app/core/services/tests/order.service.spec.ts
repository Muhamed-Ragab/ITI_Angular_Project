import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiService } from '@core/services/api.service';
import {
  CreateOrderRequest,
  GuestCheckoutRequest,
  OrderDetailResponse,
  OrderListResponse,
  OrderResponse,
} from '@domains/orders/dto';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderService, UserAddressesResponse, UserProfileResponse } from '../order.service';

// Mock ApiService factory
const createMockApiService = () => {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
};

describe('OrderService - Comprehensive Unit Tests', () => {
  let service: OrderService;
  let mockApiService: ReturnType<typeof createMockApiService>;

  beforeEach(() => {
    mockApiService = createMockApiService();

    TestBed.configureTestingModule({
      providers: [OrderService, { provide: ApiService, useValue: mockApiService }],
    });

    service = TestBed.inject(OrderService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // getUserProfile() Tests
  // ============================================

  describe('getUserProfile() - Happy Path', () => {
    it('should return user profile when API call succeeds', () => {
      const mockResponse: UserProfileResponse = {
        success: true,
        data: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
          phone: '+1234567890',
          wallet_balance: 100,
          loyalty_points: 50,
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: UserProfileResponse | undefined;
      service.getUserProfile().subscribe((response) => {
        result = response;
      });

      expect(mockApiService.get).toHaveBeenCalledWith('/users/profile');
      expect(result?.success).toBe(true);
      expect(result?.data.name).toBe('John Doe');
      expect(result?.data.email).toBe('john@example.com');
      expect(result?.data.role).toBe('customer');
    });

    it('should return profile with marketing preferences', () => {
      const mockResponse: UserProfileResponse = {
        success: true,
        data: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
          marketing_preferences: {
            push_notifications: true,
            email_newsletter: false,
            promotional_notifications: true,
          },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: UserProfileResponse | undefined;
      service.getUserProfile().subscribe((response) => {
        result = response;
      });

      expect(result?.data.marketing_preferences?.push_notifications).toBe(true);
      expect(result?.data.marketing_preferences?.email_newsletter).toBe(false);
    });
  });

  describe('getUserProfile() - Error Handling', () => {
    it('should handle 401 Unauthorized error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Authentication required' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getUserProfile().subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(401);
    });

    it('should handle 500 Internal Server Error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Server error' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getUserProfile().subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(500);
    });
  });

  // ============================================
  // validateShippingAddress() Tests
  // ============================================

  describe('validateShippingAddress() - Happy Path', () => {
    it('should return valid for complete address', () => {
      const address = {
        street: '123 Main St',
        city: 'New York',
        country: 'USA',
        zip: '10001',
      };

      const result = service.validateShippingAddress(address);

      expect(result.isValid).toBe(true);
      expect(result.missingFields).toEqual([]);
      expect(result.message).toBe('');
    });

    it('should return valid for complete address with state', () => {
      const address = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zip: '10001',
      };

      const result = service.validateShippingAddress(address);

      expect(result.isValid).toBe(true);
    });
  });

  describe('validateShippingAddress() - Edge Cases', () => {
    it('should return invalid when street is missing', () => {
      const address = {
        city: 'New York',
        country: 'USA',
        zip: '10001',
      };

      const result = service.validateShippingAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('street');
      expect(result.message).toContain('street');
    });

    it('should return invalid when city is missing', () => {
      const address = {
        street: '123 Main St',
        country: 'USA',
        zip: '10001',
      };

      const result = service.validateShippingAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('city');
    });

    it('should return invalid when country is missing', () => {
      const address = {
        street: '123 Main St',
        city: 'New York',
        zip: '10001',
      };

      const result = service.validateShippingAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('country');
    });

    it('should return invalid when zip is missing', () => {
      const address = {
        street: '123 Main St',
        city: 'New York',
        country: 'USA',
      };

      const result = service.validateShippingAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('zip');
    });

    it('should return invalid when address is null', () => {
      const result = service.validateShippingAddress(null);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('street');
    });

    it('should return invalid when address is undefined', () => {
      const result = service.validateShippingAddress(undefined);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('street');
    });

    it('should return invalid when street is empty after trim', () => {
      const address = {
        street: '   ',
        city: 'New York',
        country: 'USA',
        zip: '10001',
      };

      const result = service.validateShippingAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('street');
    });
  });

  // ============================================
  // createOrder() Tests
  // ============================================

  describe('createOrder() - Happy Path', () => {
    it('should create order when API call succeeds', () => {
      const request: Omit<CreateOrderRequest, 'items'> = {
        shippingAddressIndex: 0,
        paymentMethod: 'stripe',
      };

      const mockResponse: OrderResponse = {
        success: true,
        message: 'Order created successfully',
        data: {
          _id: 'order-123',
          status: 'pending',
          items: [],
          subtotal: 100,
          tax: 10,
          shipping: 5,
          total: 115,
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            country: 'USA',
            zip: '10001',
          },
          status_timeline: [],
          createdAt: '2024-01-01T00:00:00Z',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: OrderResponse | undefined;
      service.createOrder(request).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/orders', request);
      expect(result?.success).toBe(true);
      expect(result?.data._id).toBe('order-123');
      expect(result?.data.status).toBe('pending');
    });

    it('should create order with coupon code', () => {
      const request: Omit<CreateOrderRequest, 'items'> = {
        shippingAddressIndex: 0,
        paymentMethod: 'stripe',
        couponCode: 'SAVE10',
      };

      const mockResponse: OrderResponse = {
        success: true,
        message: 'Order created with coupon',
        data: {
          _id: 'order-123',
          status: 'pending',
          items: [],
          subtotal: 100,
          tax: 10,
          shipping: 5,
          discount: 10,
          total: 105,
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            country: 'USA',
            zip: '10001',
          },
          status_timeline: [],
          createdAt: '2024-01-01T00:00:00Z',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: OrderResponse | undefined;
      service.createOrder(request).subscribe((response) => {
        result = response;
      });

      expect(result?.data.discount).toBe(10);
    });
  });

  describe('createOrder() - Error Handling', () => {
    it('should handle 400 Bad Request when cart is empty', () => {
      const request: Omit<CreateOrderRequest, 'items'> = {
        shippingAddressIndex: 0,
        paymentMethod: 'stripe',
      };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Cart is empty' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.createOrder(request).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
      expect(caughtError?.error.message).toBe('Cart is empty');
    });

    it('should handle 400 Bad Request for invalid address', () => {
      const request: Omit<CreateOrderRequest, 'items'> = {
        shippingAddressIndex: 99,
        paymentMethod: 'stripe',
      };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Invalid shipping address' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.createOrder(request).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
    });

    it('should handle 500 Internal Server Error', () => {
      const request: Omit<CreateOrderRequest, 'items'> = {
        shippingAddressIndex: 0,
        paymentMethod: 'stripe',
      };

      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to create order' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.createOrder(request).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(500);
    });
  });

  // ============================================
  // guestCheckout() Tests
  // ============================================

  describe('guestCheckout() - Happy Path', () => {
    it('should create guest order when API call succeeds', () => {
      const request: GuestCheckoutRequest = {
        guest_info: {
          name: 'Guest User',
          email: 'guest@example.com',
          phone: '+1234567890',
        },
        shipping_address: {
          street: '123 Main St',
          city: 'New York',
          country: 'USA',
          zip: '10001',
        },
        items: [{ product: 'product-1', quantity: 2 }],
        paymentMethod: 'stripe',
      };

      const mockResponse: OrderResponse = {
        success: true,
        message: 'Guest order created successfully',
        data: {
          _id: 'guest-order-123',
          status: 'pending',
          guest_info: {
            name: 'Guest User',
            email: 'guest@example.com',
            phone: '+1234567890',
          },
          items: [],
          subtotal: 100,
          tax: 10,
          shipping: 5,
          total: 115,
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            country: 'USA',
            zip: '10001',
          },
          status_timeline: [],
          createdAt: '2024-01-01T00:00:00Z',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: OrderResponse | undefined;
      service.guestCheckout(request).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/orders/guest', request);
      expect(result?.success).toBe(true);
      expect(result?.data.guest_info?.name).toBe('Guest User');
    });
  });

  describe('guestCheckout() - Error Handling', () => {
    it('should handle 400 Bad Request for invalid email', () => {
      const request: GuestCheckoutRequest = {
        guest_info: {
          name: 'Guest User',
          email: 'invalid-email',
          phone: '+1234567890',
        },
        shipping_address: {
          street: '123 Main St',
          city: 'New York',
          country: 'USA',
          zip: '10001',
        },
        items: [{ product: 'product-1', quantity: 2 }],
        paymentMethod: 'stripe',
      };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Invalid email address' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.guestCheckout(request).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
    });
  });

  // ============================================
  // getMyOrders() Tests
  // ============================================

  describe('getMyOrders() - Happy Path', () => {
    it('should return orders list when API call succeeds', () => {
      const mockResponse: OrderListResponse = {
        success: true,
        data: {
          orders: [
            {
              _id: 'order-1',
              status: 'pending',
              items: [],
              subtotal: 100,
              tax: 10,
              shipping: 5,
              total: 115,
              shippingAddress: { street: '123', city: 'NYC', country: 'USA', zip: '10001' },
              status_timeline: [],
              createdAt: '2024-01-01',
            },
            {
              _id: 'order-2',
              status: 'delivered',
              items: [],
              subtotal: 50,
              tax: 5,
              shipping: 5,
              total: 60,
              shippingAddress: { street: '123', city: 'NYC', country: 'USA', zip: '10001' },
              status_timeline: [],
              createdAt: '2024-01-02',
            },
          ],
          pagination: { page: 1, limit: 10, total: 2, pages: 1 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: OrderListResponse | undefined;
      service.getMyOrders().subscribe((response) => {
        result = response;
      });

      expect(mockApiService.get).toHaveBeenCalledWith('/orders/me', expect.any(Object));
      expect(result?.success).toBe(true);
      expect(result?.data.orders.length).toBe(2);
      expect(result?.data.pagination.total).toBe(2);
    });

    it('should pass status filter when provided', () => {
      const mockResponse: OrderListResponse = {
        success: true,
        data: {
          orders: [
            {
              _id: 'order-1',
              status: 'pending',
              items: [],
              subtotal: 100,
              tax: 10,
              shipping: 5,
              total: 115,
              shippingAddress: { street: '123', city: 'NYC', country: 'USA', zip: '10001' },
              status_timeline: [],
              createdAt: '2024-01-01',
            },
          ],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getMyOrders({ status: 'pending' }).subscribe();

      expect(mockApiService.get).toHaveBeenCalledWith(
        '/orders/me',
        expect.objectContaining({
          toString: expect.any(Function),
        }),
      );
    });

    it('should pass pagination params when provided', () => {
      const mockResponse: OrderListResponse = {
        success: true,
        data: {
          orders: [],
          pagination: { page: 2, limit: 20, total: 0, pages: 0 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getMyOrders({ page: 2, limit: 20 }).subscribe();

      expect(mockApiService.get).toHaveBeenCalled();
    });
  });

  describe('getMyOrders() - Error Handling', () => {
    it('should handle 401 Unauthorized error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Authentication required' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getMyOrders().subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(401);
    });

    it('should handle 500 Internal Server Error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to fetch orders' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getMyOrders().subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(500);
    });
  });

  // ============================================
  // getOrderById() Tests
  // ============================================

  describe('getOrderById() - Happy Path', () => {
    it('should return order detail when API call succeeds', () => {
      const orderId = 'order-123';
      const mockResponse: OrderDetailResponse = {
        success: true,
        data: {
          _id: orderId,
          status: 'shipped',
          items: [
            { product_id: 'prod-1', name: 'Product 1', price: 50, quantity: 2, subtotal: 100 },
          ],
          subtotal: 100,
          tax: 10,
          shipping: 5,
          total: 115,
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            country: 'USA',
            zip: '10001',
          },
          status_timeline: [
            { status: 'pending', timestamp: '2024-01-01T00:00:00Z' },
            { status: 'paid', timestamp: '2024-01-01T01:00:00Z' },
            { status: 'shipped', timestamp: '2024-01-02T00:00:00Z' },
          ],
          createdAt: '2024-01-01T00:00:00Z',
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: OrderDetailResponse | undefined;
      service.getOrderById(orderId).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.get).toHaveBeenCalledWith(`/orders/${orderId}`);
      expect(result?.success).toBe(true);
      expect(result?.data._id).toBe(orderId);
      expect(result?.data.status).toBe('shipped');
      expect(result?.data.items.length).toBe(1);
      expect(result?.data.status_timeline.length).toBe(3);
    });
  });

  describe('getOrderById() - Error Handling', () => {
    it('should handle 404 Not Found error', () => {
      const orderId = 'non-existent';
      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Order not found' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getOrderById(orderId).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(404);
      expect(caughtError?.error.message).toBe('Order not found');
    });

    it('should handle 403 Forbidden for other users order', () => {
      const orderId = 'order-123';
      const errorResponse = new HttpErrorResponse({
        status: 403,
        statusText: 'Forbidden',
        error: { message: 'Access denied' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getOrderById(orderId).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(403);
    });
  });

  // ============================================
  // addUserAddress() Tests
  // ============================================

  describe('addUserAddress() - Happy Path', () => {
    it('should add new address when API call succeeds', () => {
      const address = {
        street: '456 New St',
        city: 'Los Angeles',
        country: 'USA',
        zip: '90001',
        isDefault: true,
      };

      const mockResponse: UserAddressesResponse = {
        success: true,
        data: [{ _id: 'addr-1', ...address }],
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: UserAddressesResponse | undefined;
      service.addUserAddress(address).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/users/address', address);
      expect(result?.success).toBe(true);
      expect(result?.data.length).toBe(1);
    });
  });

  describe('addUserAddress() - Error Handling', () => {
    it('should handle 400 Bad Request for invalid address', () => {
      const address = {
        street: '',
        city: '',
        country: '',
        zip: '',
      };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Invalid address data' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.addUserAddress(address).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should handle empty orders list', () => {
      const mockResponse: OrderListResponse = {
        success: true,
        data: {
          orders: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: OrderListResponse | undefined;
      service.getMyOrders().subscribe((response) => {
        result = response;
      });

      expect(result?.data.orders).toEqual([]);
      expect(result?.data.pagination.total).toBe(0);
    });

    it('should handle very long order ID', () => {
      const longId = 'a'.repeat(500);

      const mockResponse: OrderDetailResponse = {
        success: true,
        data: {
          _id: longId,
          status: 'pending',
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
          shippingAddress: { street: '', city: '', country: '', zip: '' },
          status_timeline: [],
          createdAt: '',
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: OrderDetailResponse | undefined;
      service.getOrderById(longId).subscribe((response) => {
        result = response;
      });

      expect(result?.data._id).toBe(longId);
    });
  });
});
