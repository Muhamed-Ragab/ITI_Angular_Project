import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiService } from '@core/services/api.service';
import {
  CheckoutPaymentRequest,
  CheckoutPaymentResponse,
  ValidateCouponRequest,
  ValidateCouponResponse,
} from '@domains/payment/dto';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentService } from '../payment.service';

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

describe('PaymentService - Comprehensive Unit Tests', () => {
  let service: PaymentService;
  let mockApiService: ReturnType<typeof createMockApiService>;

  beforeEach(() => {
    mockApiService = createMockApiService();

    TestBed.configureTestingModule({
      providers: [PaymentService, { provide: ApiService, useValue: mockApiService }],
    });

    service = TestBed.inject(PaymentService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // processCheckout() Tests
  // ============================================

  describe('processCheckout() - Happy Path', () => {
    it('should process checkout payment when API call succeeds', () => {
      const request: CheckoutPaymentRequest = {
        orderId: 'order-123',
        method: 'stripe',
      };

      const mockResponse: CheckoutPaymentResponse = {
        success: true,
        message: 'Payment initiated successfully',
        data: {
          orderId: 'order-123',
          paymentStatus: 'pending',
          clientSecret: 'cs_test_xxx',
          method: 'stripe',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: CheckoutPaymentResponse | undefined;
      service.processCheckout(request).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/payments/checkout', request);
      expect(result?.success).toBe(true);
      expect(result?.data.orderId).toBe('order-123');
      expect(result?.data.clientSecret).toBe('cs_test_xxx');
    });

    it('should process checkout with PayPal method', () => {
      const request: CheckoutPaymentRequest = {
        orderId: 'order-123',
        method: 'paypal',
      };

      const mockResponse: CheckoutPaymentResponse = {
        success: true,
        data: {
          orderId: 'order-123',
          paymentStatus: 'pending',
          method: 'paypal',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: CheckoutPaymentResponse | undefined;
      service.processCheckout(request).subscribe((response) => {
        result = response;
      });

      expect(result?.data.method).toBe('paypal');
    });

    it('should process checkout with COD method', () => {
      const request: CheckoutPaymentRequest = {
        orderId: 'order-123',
        method: 'cod',
      };

      const mockResponse: CheckoutPaymentResponse = {
        success: true,
        data: {
          orderId: 'order-123',
          paymentStatus: 'pending',
          method: 'cod',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: CheckoutPaymentResponse | undefined;
      service.processCheckout(request).subscribe((response) => {
        result = response;
      });

      expect(result?.data.method).toBe('cod');
    });

    it('should process checkout with wallet method', () => {
      const request: CheckoutPaymentRequest = {
        orderId: 'order-123',
        method: 'wallet',
      };

      const mockResponse: CheckoutPaymentResponse = {
        success: true,
        data: {
          orderId: 'order-123',
          paymentStatus: 'paid',
          transactionId: 'txn_wallet_123',
          method: 'wallet',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: CheckoutPaymentResponse | undefined;
      service.processCheckout(request).subscribe((response) => {
        result = response;
      });

      expect(result?.data.transactionId).toBe('txn_wallet_123');
      expect(result?.data.paymentStatus).toBe('paid');
    });

    it('should process checkout with saved payment method', () => {
      const request: CheckoutPaymentRequest = {
        orderId: 'order-123',
        method: 'stripe',
        savedMethodId: 'pm_saved_123',
      };

      const mockResponse: CheckoutPaymentResponse = {
        success: true,
        data: {
          orderId: 'order-123',
          paymentStatus: 'paid',
          transactionId: 'txn_123',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: CheckoutPaymentResponse | undefined;
      service.processCheckout(request).subscribe((response) => {
        result = response;
      });

      expect(result?.success).toBe(true);
    });
  });

  describe('processCheckout() - Error Handling', () => {
    it('should handle 400 Bad Request for invalid order', () => {
      const request: CheckoutPaymentRequest = {
        orderId: 'invalid-order',
        method: 'stripe',
      };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Order not found' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.processCheckout(request).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
      expect(caughtError?.error.message).toBe('Order not found');
    });

    it('should handle 400 Bad Request for invalid payment method', () => {
      const request: CheckoutPaymentRequest = {
        orderId: 'order-123',
        method: 'invalid_method' as any,
      };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Invalid payment method' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.processCheckout(request).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
    });

    it('should handle 402 Payment Required for insufficient wallet balance', () => {
      const request: CheckoutPaymentRequest = {
        orderId: 'order-123',
        method: 'wallet',
      };

      const errorResponse = new HttpErrorResponse({
        status: 402,
        statusText: 'Payment Required',
        error: { message: 'Insufficient wallet balance' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.processCheckout(request).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(402);
    });

    it('should handle 500 Internal Server Error', () => {
      const request: CheckoutPaymentRequest = {
        orderId: 'order-123',
        method: 'stripe',
      };

      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Payment processing failed' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.processCheckout(request).subscribe({
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
  // processGuestCheckout() Tests
  // ============================================

  describe('processGuestCheckout() - Happy Path', () => {
    it('should process guest checkout when API call succeeds', () => {
      const request: CheckoutPaymentRequest = {
        orderId: 'guest-order-123',
        method: 'stripe',
        guestEmail: 'guest@example.com',
      };

      const mockResponse: CheckoutPaymentResponse = {
        success: true,
        message: 'Guest payment initiated',
        data: {
          orderId: 'guest-order-123',
          paymentStatus: 'pending',
          clientSecret: 'cs_test_guest',
          method: 'stripe',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: CheckoutPaymentResponse | undefined;
      service.processGuestCheckout(request).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/payments/guest-checkout', request);
      expect(result?.success).toBe(true);
    });

    it('should process guest checkout with COD', () => {
      const request: CheckoutPaymentRequest = {
        orderId: 'guest-order-123',
        method: 'cod',
        guestEmail: 'guest@example.com',
      };

      const mockResponse: CheckoutPaymentResponse = {
        success: true,
        data: {
          orderId: 'guest-order-123',
          paymentStatus: 'pending',
          method: 'cod',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: CheckoutPaymentResponse | undefined;
      service.processGuestCheckout(request).subscribe((response) => {
        result = response;
      });

      expect(result?.data.method).toBe('cod');
    });
  });

  describe('processGuestCheckout() - Error Handling', () => {
    it('should handle 400 Bad Request for missing guest email', () => {
      const request: CheckoutPaymentRequest = {
        orderId: 'guest-order-123',
        method: 'stripe',
        guestEmail: '',
      };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Guest email is required' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.processGuestCheckout(request).subscribe({
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
  // validateCoupon() Tests
  // ============================================

  describe('validateCoupon() - Happy Path', () => {
    it('should validate percentage coupon when API call succeeds', () => {
      const mockResponse: ValidateCouponResponse = {
        success: true,
        data: {
          coupon_info: {
            code: 'SAVE10',
            type: 'percentage',
            value: 10,
            discount_amount: 10,
          },
          discount_amount: 10,
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: ValidateCouponResponse | undefined;
      service.validateCoupon('SAVE10', 100).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/coupons/validate', {
        code: 'SAVE10',
        subtotal_amount: 100,
      } as ValidateCouponRequest);
      expect(result?.success).toBe(true);
      expect(result?.data?.coupon_info?.type).toBe('percentage');
      expect(result?.data?.discount_amount).toBe(10);
    });

    it('should validate fixed discount coupon', () => {
      const mockResponse: ValidateCouponResponse = {
        success: true,
        data: {
          coupon_info: {
            code: 'FLAT20',
            type: 'fixed',
            value: 20,
            discount_amount: 20,
          },
          discount_amount: 20,
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: ValidateCouponResponse | undefined;
      service.validateCoupon('FLAT20', 100).subscribe((response) => {
        result = response;
      });

      expect(result?.data?.coupon_info?.type).toBe('fixed');
      expect(result?.data?.coupon_info?.value).toBe(20);
    });

    it('should validate coupon without subtotal amount', () => {
      const mockResponse: ValidateCouponResponse = {
        success: true,
        data: {
          coupon_info: {
            code: 'SAVE10',
            type: 'percentage',
            value: 10,
            discount_amount: 0,
          },
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: ValidateCouponResponse | undefined;
      service.validateCoupon('SAVE10').subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/coupons/validate', {
        code: 'SAVE10',
        subtotal_amount: undefined,
      });
    });

    it('should handle legacy coupon response format', () => {
      const mockResponse: ValidateCouponResponse = {
        success: true,
        data: {
          code: 'LEGACY10',
          discountType: 'percentage',
          discountValue: 10,
          minOrderAmount: 50,
          expiresAt: '2024-12-31T23:59:59Z',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: ValidateCouponResponse | undefined;
      service.validateCoupon('LEGACY10', 100).subscribe((response) => {
        result = response;
      });

      expect(result?.data?.discountType).toBe('percentage');
      expect(result?.data?.discountValue).toBe(10);
    });
  });

  describe('validateCoupon() - Error Handling', () => {
    it('should handle 400 Bad Request for invalid coupon code', () => {
      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {
          message: 'Invalid coupon code',
          code: 'INVALID_COUPON',
        },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.validateCoupon('INVALID').subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
      expect(caughtError?.error.message).toBe('Invalid coupon code');
    });

    it('should handle 400 Bad Request for expired coupon', () => {
      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {
          message: 'Coupon has expired',
          code: 'EXPIRED_COUPON',
        },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.validateCoupon('EXPIRED').subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
      expect(caughtError?.error.code).toBe('EXPIRED_COUPON');
    });

    it('should handle 400 Bad Request for minimum order amount not met', () => {
      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {
          message: 'Minimum order amount not met',
          code: 'MIN_ORDER_NOT_MET',
          details: [
            {
              path: 'subtotal_amount',
              message: 'Minimum order amount is $50',
              code: 'MIN_ORDER',
            },
          ],
        },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.validateCoupon('SAVE10', 30).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
      expect(caughtError?.error.details?.[0]?.code).toBe('MIN_ORDER');
    });

    it('should handle 400 Bad Request for usage limit exceeded', () => {
      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {
          message: 'Coupon usage limit exceeded',
          code: 'USAGE_LIMIT_EXCEEDED',
        },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.validateCoupon('POPULAR').subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
      expect(caughtError?.error.code).toBe('USAGE_LIMIT_EXCEEDED');
    });

    it('should handle 500 Internal Server Error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to validate coupon' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.validateCoupon('TEST').subscribe({
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
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should handle very long coupon code', () => {
      const longCode = 'A'.repeat(500);

      const mockResponse: ValidateCouponResponse = {
        success: false,
        error: {
          code: 'INVALID_COUPON',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: ValidateCouponResponse | undefined;
      service.validateCoupon(longCode).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalled();
    });

    it('should handle zero subtotal amount', () => {
      const mockResponse: ValidateCouponResponse = {
        success: false,
        error: {
          code: 'MIN_ORDER_NOT_MET',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: ValidateCouponResponse | undefined;
      service.validateCoupon('SAVE10', 0).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalled();
    });

    it('should handle negative subtotal amount', () => {
      const mockResponse: ValidateCouponResponse = {
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: ValidateCouponResponse | undefined;
      service.validateCoupon('SAVE10', -10).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalled();
    });

    it('should handle network error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
        error: { message: 'Network error' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.validateCoupon('TEST').subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(0);
    });
  });
});
