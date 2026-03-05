import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentService } from './payment.service';
import { ApiService } from './api.service';
import { environment } from '@env/environment';

/**
 * Integration tests for PaymentService
 * These tests verify actual API interactions and response handling
 */
describe('PaymentService - Integration Tests', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl || 'http://localhost:3000/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentService, ApiService],
    });

    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('POST /payments/checkout - Process Checkout', () => {
    it('should successfully process checkout with stripe', (done) => {
      const checkoutRequest = {
        orderId: 'order123',
        method: 'stripe' as const,
      };

      const mockResponse = {
        success: true,
        message: 'Payment processed successfully',
        data: {
          orderId: 'order123',
          paymentStatus: 'paid' as const,
          transactionId: 'txn_stripe_123',
          clientSecret: 'pi_secret_123',
        },
      };

      service.processCheckout(checkoutRequest).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.orderId).toBe('order123');
          expect(response.data.paymentStatus).toBe('paid');
          expect(response.data.transactionId).toBe('txn_stripe_123');
          expect(response.data.clientSecret).toBe('pi_secret_123');
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/payments/checkout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(checkoutRequest);
      req.flush(mockResponse);
    });

    it('should successfully process checkout with paypal', (done) => {
      const checkoutRequest = {
        orderId: 'order123',
        method: 'paypal' as const,
      };

      const mockResponse = {
        success: true,
        message: 'Payment processed successfully',
        data: {
          orderId: 'order123',
          paymentStatus: 'paid' as const,
          transactionId: 'paypal_txn_123',
        },
      };

      service.processCheckout(checkoutRequest).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.paymentStatus).toBe('paid');
          expect(response.data.transactionId).toBe('paypal_txn_123');
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/payments/checkout`);
      req.flush(mockResponse);
    });

    it('should successfully process checkout with COD', (done) => {
      const checkoutRequest = {
        orderId: 'order123',
        method: 'cod' as const,
      };

      const mockResponse = {
        success: true,
        message: 'Order placed successfully',
        data: {
          orderId: 'order123',
          paymentStatus: 'pending' as const,
          transactionId: 'cod_order123',
        },
      };

      service.processCheckout(checkoutRequest).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.paymentStatus).toBe('pending');
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/payments/checkout`);
      req.flush(mockResponse);
    });

    it('should successfully process checkout with wallet', (done) => {
      const checkoutRequest = {
        orderId: 'order123',
        method: 'wallet' as const,
      };

      const mockResponse = {
        success: true,
        message: 'Payment processed from wallet',
        data: {
          orderId: 'order123',
          paymentStatus: 'paid' as const,
          transactionId: 'wallet_txn_123',
        },
      };

      service.processCheckout(checkoutRequest).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.paymentStatus).toBe('paid');
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/payments/checkout`);
      req.flush(mockResponse);
    });

    it('should handle payment failure', (done) => {
      const checkoutRequest = {
        orderId: 'order123',
        method: 'stripe' as const,
      };

      const mockResponse = {
        success: false,
        message: 'Payment failed',
        data: {
          orderId: 'order123',
          paymentStatus: 'failed' as const,
          transactionId: 'txn_failed_123',
        },
      };

      service.processCheckout(checkoutRequest).subscribe({
        next: (response) => {
          expect(response.success).toBe(false);
          expect(response.data.paymentStatus).toBe('failed');
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/payments/checkout`);
      req.flush(mockResponse);
    });

    it('should handle insufficient wallet balance', (done) => {
      const checkoutRequest = {
        orderId: 'order123',
        method: 'wallet' as const,
      };

      service.processCheckout(checkoutRequest).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/payments/checkout`);
      req.flush(
        { message: 'Insufficient wallet balance' },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    it('should handle invalid order ID', (done) => {
      const checkoutRequest = {
        orderId: 'invalid-order',
        method: 'stripe' as const,
      };

      service.processCheckout(checkoutRequest).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/payments/checkout`);
      req.flush({ message: 'Order not found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should handle payment processing error', (done) => {
      const checkoutRequest = {
        orderId: 'order123',
        method: 'stripe' as const,
      };

      service.processCheckout(checkoutRequest).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/payments/checkout`);
      req.flush(
        { message: 'Payment gateway error' },
        { status: 500, statusText: 'Internal Server Error' },
      );
    });
  });

  describe('POST /payments/guest-checkout - Process Guest Checkout', () => {
    it('should successfully process guest checkout', (done) => {
      const guestCheckoutRequest = {
        orderId: 'order456',
        method: 'cod' as const,
        guestEmail: 'guest@example.com',
      };

      const mockResponse = {
        success: true,
        message: 'Guest payment processed successfully',
        data: {
          orderId: 'order456',
          paymentStatus: 'pending' as const,
          transactionId: 'guest_cod_456',
        },
      };

      service.processGuestCheckout(guestCheckoutRequest).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.orderId).toBe('order456');
          expect(response.data.paymentStatus).toBe('pending');
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/payments/guest-checkout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(guestCheckoutRequest);
      req.flush(mockResponse);
    });

    it('should process guest checkout with stripe', (done) => {
      const guestCheckoutRequest = {
        orderId: 'order456',
        method: 'stripe' as const,
        guestEmail: 'guest@example.com',
      };

      const mockResponse = {
        success: true,
        message: 'Payment processed successfully',
        data: {
          orderId: 'order456',
          paymentStatus: 'paid' as const,
          transactionId: 'guest_stripe_456',
          clientSecret: 'pi_guest_secret_456',
        },
      };

      service.processGuestCheckout(guestCheckoutRequest).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data.clientSecret).toBe('pi_guest_secret_456');
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/payments/guest-checkout`);
      req.flush(mockResponse);
    });

    it('should handle missing guest email', (done) => {
      const guestCheckoutRequest = {
        orderId: 'order456',
        method: 'cod' as const,
      };

      service.processGuestCheckout(guestCheckoutRequest).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/payments/guest-checkout`);
      req.flush(
        { message: 'Guest email is required' },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    it('should not allow wallet payment for guests', (done) => {
      const guestCheckoutRequest = {
        orderId: 'order456',
        method: 'wallet' as const,
        guestEmail: 'guest@example.com',
      };

      service.processGuestCheckout(guestCheckoutRequest).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/payments/guest-checkout`);
      req.flush(
        { message: 'Wallet payment not available for guests' },
        { status: 400, statusText: 'Bad Request' },
      );
    });
  });

  describe('POST /coupons/validate - Validate Coupon', () => {
    it('should successfully validate percentage coupon', (done) => {
      const couponCode = 'SAVE20';
      const subtotalAmount = 1000;

      const mockResponse = {
        success: true,
        data: {
          coupon_info: {
            code: 'SAVE20',
            type: 'percentage' as const,
            value: 20,
            discount_amount: 200,
          },
        },
      };

      service.validateCoupon(couponCode, subtotalAmount).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data?.coupon_info?.code).toBe('SAVE20');
          expect(response.data?.coupon_info?.type).toBe('percentage');
          expect(response.data?.coupon_info?.value).toBe(20);
          expect(response.data?.coupon_info?.discount_amount).toBe(200);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/coupons/validate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        code: couponCode,
        subtotal_amount: subtotalAmount,
      });
      req.flush(mockResponse);
    });

    it('should successfully validate fixed amount coupon', (done) => {
      const couponCode = 'FLAT50';
      const subtotalAmount = 500;

      const mockResponse = {
        success: true,
        data: {
          coupon_info: {
            code: 'FLAT50',
            type: 'fixed' as const,
            value: 50,
            discount_amount: 50,
          },
        },
      };

      service.validateCoupon(couponCode, subtotalAmount).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data?.coupon_info?.type).toBe('fixed');
          expect(response.data?.coupon_info?.discount_amount).toBe(50);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/coupons/validate`);
      req.flush(mockResponse);
    });

    it('should validate coupon without subtotal amount', (done) => {
      const couponCode = 'WELCOME10';

      const mockResponse = {
        success: true,
        data: {
          coupon_info: {
            code: 'WELCOME10',
            type: 'percentage' as const,
            value: 10,
            discount_amount: 0,
          },
        },
      };

      service.validateCoupon(couponCode).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data?.coupon_info?.code).toBe('WELCOME10');
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/coupons/validate`);
      expect(req.request.body.subtotal_amount).toBeUndefined();
      req.flush(mockResponse);
    });

    it('should handle invalid coupon code', (done) => {
      const couponCode = 'INVALID';

      const mockResponse = {
        success: false,
        message: 'Invalid coupon code',
      };

      service.validateCoupon(couponCode).subscribe({
        next: (response) => {
          expect(response.success).toBe(false);
          expect(response.message).toBe('Invalid coupon code');
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/coupons/validate`);
      req.flush(mockResponse);
    });

    it('should handle expired coupon', (done) => {
      const couponCode = 'EXPIRED';

      service.validateCoupon(couponCode).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/coupons/validate`);
      req.flush({ message: 'Coupon has expired' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle minimum order amount not met', (done) => {
      const couponCode = 'BIG100';
      const subtotalAmount = 50;

      service.validateCoupon(couponCode, subtotalAmount).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/coupons/validate`);
      req.flush(
        { message: 'Minimum order amount not met' },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    it('should handle coupon usage limit exceeded', (done) => {
      const couponCode = 'LIMITED';

      service.validateCoupon(couponCode).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/coupons/validate`);
      req.flush(
        { message: 'Coupon usage limit exceeded' },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    it('should handle legacy coupon response format', (done) => {
      const couponCode = 'LEGACY10';
      const subtotalAmount = 1000;

      const mockResponse = {
        success: true,
        data: {
          code: 'LEGACY10',
          discountType: 'percentage' as const,
          discountValue: 10,
          minOrderAmount: 500,
          expiresAt: '2025-12-31T23:59:59Z',
        },
      };

      service.validateCoupon(couponCode, subtotalAmount).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data?.code).toBe('LEGACY10');
          expect(response.data?.discountType).toBe('percentage');
          expect(response.data?.discountValue).toBe(10);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/coupons/validate`);
      req.flush(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', (done) => {
      const checkoutRequest = {
        orderId: 'order123',
        method: 'stripe' as const,
      };

      service.processCheckout(checkoutRequest).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/payments/checkout`);
      req.error(new ProgressEvent('Network error'));
    });

    it('should handle timeout errors', (done) => {
      const checkoutRequest = {
        orderId: 'order123',
        method: 'stripe' as const,
      };

      service.processCheckout(checkoutRequest).subscribe({
        next: () => done.fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(504);
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/payments/checkout`);
      req.flush({ message: 'Gateway timeout' }, { status: 504, statusText: 'Gateway Timeout' });
    });

    it('should handle malformed response', (done) => {
      const checkoutRequest = {
        orderId: 'order123',
        method: 'stripe' as const,
      };

      service.processCheckout(checkoutRequest).subscribe({
        next: (response) => {
          // Service should still handle it
          expect(response).toBeDefined();
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/payments/checkout`);
      req.flush({ invalid: 'response' } as any);
    });
  });

  describe('Payment Method Validation', () => {
    it('should accept all valid payment methods', () => {
      const validMethods: Array<'stripe' | 'paypal' | 'cod' | 'wallet'> = [
        'stripe',
        'paypal',
        'cod',
        'wallet',
      ];

      validMethods.forEach((method) => {
        const request = {
          orderId: 'order123',
          method: method,
        };

        service.processCheckout(request).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/payments/checkout`);
        expect(req.request.body.method).toBe(method);
        req.flush({
          success: true,
          message: 'Success',
          data: {
            orderId: 'order123',
            paymentStatus: 'paid' as const,
            transactionId: 'txn_123',
          },
        });
      });
    });
  });
});
