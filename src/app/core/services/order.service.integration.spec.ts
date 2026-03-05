import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { ApiService } from './api.service';
import { environment } from '@env/environment';

/**
 * Integration tests for OrderService
 * These tests verify actual API interactions and response handling
 */
describe('OrderService - Integration Tests', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl || 'http://localhost:3000/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService, ApiService],
    });

    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('GET /users/profile - Get User Profile', () => {
    it('should successfully fetch user profile', (done) => {
      const mockResponse = {
        success: true,
        data: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
          phone: '+1234567890',
          wallet_balance: 1000,
          loyalty_points: 50,
          referral_code: 'REF123',
          marketing_preferences: {
            push_notifications: true,
            email_newsletter: true,
            promotional_notifications: false,
          },
          preferred_language: 'en',
          addresses: [
            {
              _id: 'addr1',
              street: '123 Main St',
              city: 'New York',
              country: 'USA',
              zip: '10001',
              state: 'NY',
              isDefault: true,
            },
          ],
        },
      };

      service.getUserProfile().subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.id).toBe('user123');
          expect(response.data.name).toBe('John Doe');
          expect(response.data.email).toBe('john@example.com');
          expect(response.data.addresses).toBeDefined();
          expect(response.data.addresses!.length).toBe(1);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/users/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle profile without addresses', (done) => {
      const mockResponse = {
        success: true,
        data: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
        },
      };

      service.getUserProfile().subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.addresses).toBeUndefined();
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/users/profile`);
      req.flush(mockResponse);
    });

    it('should handle 401 unauthorized', (done) => {
      service.getUserProfile().subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/users/profile`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('GET /users/address - Get User Addresses', () => {
    it('should successfully fetch user addresses from profile', (done) => {
      const mockProfileResponse = {
        success: true,
        data: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
          addresses: [
            {
              _id: 'addr1',
              street: '123 Main St',
              city: 'New York',
              country: 'USA',
              zip: '10001',
              state: 'NY',
              isDefault: true,
            },
            {
              _id: 'addr2',
              street: '456 Oak Ave',
              city: 'Los Angeles',
              country: 'USA',
              zip: '90001',
              state: 'CA',
              isDefault: false,
            },
          ],
        },
      };

      service.getUserAddresses().subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.length).toBe(2);
          expect(response.data[0]._id).toBe('addr1');
          expect(response.data[0].street).toBe('123 Main St');
          expect(response.data[1]._id).toBe('addr2');
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/users/profile`);
      req.flush(mockProfileResponse);
    });

    it('should filter out invalid addresses', (done) => {
      const mockProfileResponse = {
        success: true,
        data: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
          addresses: [
            {
              _id: 'addr1',
              street: '123 Main St',
              city: 'New York',
              country: 'USA',
              zip: '10001',
            },
            {
              _id: 'addr2',
              street: '', // Invalid - missing street
              city: 'Los Angeles',
              country: 'USA',
              zip: '90001',
            },
            {
              _id: 'addr3',
              street: '789 Pine Rd',
              city: '', // Invalid - missing city
              country: 'USA',
              zip: '80001',
            },
          ],
        },
      };

      service.getUserAddresses().subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.length).toBe(1); // Only valid address
          expect(response.data[0]._id).toBe('addr1');
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/users/profile`);
      req.flush(mockProfileResponse);
    });

    it('should handle profile with no addresses', (done) => {
      const mockProfileResponse = {
        success: true,
        data: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
        },
      };

      service.getUserAddresses().subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.length).toBe(0);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/users/profile`);
      req.flush(mockProfileResponse);
    });
  });

  describe('POST /users/address - Add User Address', () => {
    it('should successfully add new address', (done) => {
      const newAddress = {
        street: '789 Elm St',
        city: 'Chicago',
        country: 'USA',
        zip: '60601',
        state: 'IL',
        isDefault: false,
      };

      const mockResponse = {
        success: true,
        data: [
          {
            _id: 'addr1',
            street: '123 Main St',
            city: 'New York',
            country: 'USA',
            zip: '10001',
            isDefault: true,
          },
          {
            _id: 'addr2',
            ...newAddress,
          },
        ],
      };

      service.addUserAddress(newAddress).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.length).toBe(2);
          expect(response.data[1].street).toBe('789 Elm St');
          expect(response.data[1].city).toBe('Chicago');
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/users/address`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newAddress);
      req.flush(mockResponse);
    });

    it('should handle validation errors', (done) => {
      const invalidAddress = {
        street: '',
        city: 'Chicago',
        country: 'USA',
        zip: '60601',
      };

      service.addUserAddress(invalidAddress as any).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/users/address`);
      req.flush(
        { message: 'Street is required' },
        { status: 400, statusText: 'Bad Request' },
      );
    });
  });

  describe('Address Validation', () => {
    it('should validate complete address', () => {
      const validAddress = {
        _id: 'addr1',
        street: '123 Main St',
        city: 'New York',
        country: 'USA',
        zip: '10001',
        state: 'NY',
        isDefault: true,
      };

      const result = service.validateShippingAddress(validAddress);

      expect(result.isValid).toBe(true);
      expect(result.missingFields.length).toBe(0);
      expect(result.message).toBe('');
    });

    it('should detect missing street', () => {
      const address = {
        _id: 'addr1',
        street: '',
        city: 'New York',
        country: 'USA',
        zip: '10001',
      };

      const result = service.validateShippingAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('street');
      expect(result.message).toContain('street');
    });

    it('should detect missing city', () => {
      const address = {
        _id: 'addr1',
        street: '123 Main St',
        city: '',
        country: 'USA',
        zip: '10001',
      };

      const result = service.validateShippingAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('city');
    });

    it('should detect missing country', () => {
      const address = {
        _id: 'addr1',
        street: '123 Main St',
        city: 'New York',
        country: '',
        zip: '10001',
      };

      const result = service.validateShippingAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('country');
    });

    it('should detect missing zip', () => {
      const address = {
        _id: 'addr1',
        street: '123 Main St',
        city: 'New York',
        country: 'USA',
        zip: '',
      };

      const result = service.validateShippingAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('zip');
    });

    it('should detect multiple missing fields', () => {
      const address = {
        _id: 'addr1',
        street: '',
        city: '',
        country: 'USA',
        zip: '10001',
      };

      const result = service.validateShippingAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.missingFields.length).toBe(2);
      expect(result.missingFields).toContain('street');
      expect(result.missingFields).toContain('city');
    });

    it('should handle null address', () => {
      const result = service.validateShippingAddress(null);

      expect(result.isValid).toBe(false);
      expect(result.missingFields.length).toBe(4);
    });

    it('should handle undefined address', () => {
      const result = service.validateShippingAddress(undefined);

      expect(result.isValid).toBe(false);
      expect(result.missingFields.length).toBe(4);
    });
  });

  describe('POST /orders - Create Order', () => {
    it('should successfully create order', (done) => {
      const orderRequest = {
        shippingAddress: 'addr1',
        paymentMethod: 'stripe',
        couponCode: 'SAVE10',
      };

      const mockResponse = {
        success: true,
        message: 'Order created successfully',
        data: {
          _id: 'order123',
          id: 'order123',
          user: 'user123',
          orderNumber: 'ORD-2024-001',
          status: 'pending',
          items: [
            {
              product_id: 'prod1',
              name: 'Product 1',
              price: 100,
              quantity: 2,
              subtotal: 200,
            },
          ],
          subtotal: 200,
          tax: 20,
          shipping: 50,
          discount: 20,
          total: 250,
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            country: 'USA',
            zip: '10001',
          },
          payment: {
            method: 'stripe',
            status: 'pending',
          },
          status_timeline: [
            {
              status: 'pending',
              timestamp: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
        },
      };

      service.createOrder(orderRequest as any).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data._id).toBe('order123');
          expect(response.data.status).toBe('pending');
          expect(response.data.total).toBe(250);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/orders`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(orderRequest);
      req.flush(mockResponse);
    });

    it('should handle invalid shipping address', (done) => {
      const orderRequest = {
        shippingAddress: 'invalid-addr',
        paymentMethod: 'stripe',
      };

      service.createOrder(orderRequest as any).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/orders`);
      req.flush(
        { message: 'Invalid shipping address' },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    it('should handle empty cart error', (done) => {
      const orderRequest = {
        shippingAddress: 'addr1',
        paymentMethod: 'stripe',
      };

      service.createOrder(orderRequest as any).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/orders`);
      req.flush({ message: 'Cart is empty' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('POST /orders/guest - Guest Checkout', () => {
    it('should successfully create guest order', (done) => {
      const guestRequest = {
        guest_info: {
          name: 'Guest User',
          email: 'guest@example.com',
          phone: '+1234567890',
        },
        guestEmail: 'guest@example.com',
        shipping_address: {
          street: '123 Main St',
          city: 'New York',
          country: 'USA',
          zip: '10001',
        },
        items: [
          {
            product_id: 'prod1',
            quantity: 2,
          },
        ],
        paymentMethod: 'cod',
      };

      const mockResponse = {
        success: true,
        message: 'Guest order created successfully',
        data: {
          _id: 'order456',
          id: 'order456',
          user: null,
          guest_info: guestRequest.guest_info,
          status: 'pending',
          items: [
            {
              product: 'prod1',
              seller_id: 'seller1',
              title: 'Product 1',
              price: 100,
              quantity: 2,
            },
          ],
          subtotal_amount: 200,
          tax_amount: 20,
          shipping_amount: 50,
          total_amount: 270,
          shipping_address: guestRequest.shipping_address,
          payment_info: {
            status: 'pending',
            method: 'cod',
          },
          status_timeline: [
            {
              status: 'pending',
              timestamp: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
        },
      };

      service.guestCheckout(guestRequest).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data._id).toBe('order456');
          expect(response.data.guest_info).toBeDefined();
          expect(response.data.guest_info!.email).toBe('guest@example.com');
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/orders/guest`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(guestRequest);
      req.flush(mockResponse);
    });

    it('should handle missing guest info', (done) => {
      const invalidRequest = {
        guest_info: {
          name: '',
          email: '',
          phone: '',
        },
        shipping_address: {
          street: '123 Main St',
          city: 'New York',
          country: 'USA',
          zip: '10001',
        },
        items: [],
        paymentMethod: 'cod',
      };

      service.guestCheckout(invalidRequest as any).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/orders/guest`);
      req.flush(
        { message: 'Guest information is required' },
        { status: 400, statusText: 'Bad Request' },
      );
    });
  });

  describe('GET /orders/me - Get My Orders', () => {
    it('should successfully fetch user orders', (done) => {
      const mockResponse = {
        success: true,
        data: {
          orders: [
            {
              _id: 'order1',
              orderNumber: 'ORD-2024-001',
              status: 'delivered',
              total: 250,
              createdAt: new Date().toISOString(),
              items: [],
              subtotal: 200,
              tax: 20,
              shipping: 50,
              shippingAddress: {
                street: '123 Main St',
                city: 'New York',
                country: 'USA',
                zip: '10001',
              },
              status_timeline: [],
            },
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            pages: 1,
          },
        },
      };

      service.getMyOrders().subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.orders.length).toBe(1);
          expect(response.data.orders[0]._id).toBe('order1');
          expect(response.data.pagination.total).toBe(1);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/orders/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should filter orders by status', (done) => {
      const mockResponse = {
        success: true,
        data: {
          orders: [
            {
              _id: 'order1',
              status: 'pending',
              total: 250,
              createdAt: new Date().toISOString(),
              items: [],
              subtotal: 200,
              tax: 20,
              shipping: 50,
              shippingAddress: {
                street: '123 Main St',
                city: 'New York',
                country: 'USA',
                zip: '10001',
              },
              status_timeline: [],
            },
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            pages: 1,
          },
        },
      };

      service.getMyOrders({ status: 'pending' }).subscribe({
        next: (response) => {
          expect(response.data.orders.length).toBe(1);
          expect(response.data.orders[0].status).toBe('pending');
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${baseUrl}/orders/me` && request.params.get('status') === 'pending';
      });
      req.flush(mockResponse);
    });

    it('should handle pagination', (done) => {
      const mockResponse = {
        success: true,
        data: {
          orders: [],
          pagination: {
            page: 2,
            limit: 5,
            total: 15,
            pages: 3,
          },
        },
      };

      service.getMyOrders({ page: 2, limit: 5 }).subscribe({
        next: (response) => {
          expect(response.data.pagination.page).toBe(2);
          expect(response.data.pagination.limit).toBe(5);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne((request) => {
        return (
          request.url === `${baseUrl}/orders/me` &&
          request.params.get('page') === '2' &&
          request.params.get('limit') === '5'
        );
      });
      req.flush(mockResponse);
    });
  });

  describe('GET /orders/:id - Get Order By ID', () => {
    it('should successfully fetch order details', (done) => {
      const orderId = 'order123';

      const mockResponse = {
        success: true,
        data: {
          _id: orderId,
          orderNumber: 'ORD-2024-001',
          status: 'delivered',
          items: [
            {
              product_id: 'prod1',
              name: 'Product 1',
              price: 100,
              quantity: 2,
              subtotal: 200,
            },
          ],
          subtotal: 200,
          tax: 20,
          shipping: 50,
          total: 270,
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            country: 'USA',
            zip: '10001',
          },
          payment: {
            method: 'stripe',
            status: 'paid',
            transactionId: 'txn_123',
          },
          tracking: {
            number: 'TRACK123',
            carrier: 'UPS',
          },
          status_timeline: [
            {
              status: 'pending',
              timestamp: new Date().toISOString(),
            },
            {
              status: 'delivered',
              timestamp: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
        },
      };

      service.getOrderById(orderId).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data._id).toBe(orderId);
          expect(response.data.status).toBe('delivered');
          expect(response.data.tracking).toBeDefined();
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/orders/${orderId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle order not found', (done) => {
      const orderId = 'non-existent';

      service.getOrderById(orderId).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/orders/${orderId}`);
      req.flush({ message: 'Order not found' }, { status: 404, statusText: 'Not Found' });
    });
  });
});
