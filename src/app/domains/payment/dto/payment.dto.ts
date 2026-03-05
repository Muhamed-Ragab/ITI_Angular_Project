/**
 * Payment Domain DTOs
 * Data Transfer Objects for payment operations
 */

export type PaymentMethod = 'stripe' | 'paypal' | 'cod' | 'wallet';

// Create Payment Intent Request
export interface CreatePaymentIntentRequest {
  orderId: string;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  data: {
    clientSecret: string;
    paymentIntentId: string;
  };
}

// Checkout Payment Request
export interface CheckoutPaymentRequest {
  orderId: string;
  method: PaymentMethod;
  savedMethodId?: string;
  guestEmail?: string;
}

export interface CheckoutPaymentResponse {
  success: boolean;
  message?: string;
  data: {
    orderId?: string;
    paymentStatus?: 'paid' | 'pending' | 'failed';
    status?: 'paid' | 'pending' | 'failed';
    transactionId?: string;
    clientSecret?: string;
    method?: PaymentMethod;
    message?: string;
  };
}

// Payment Status
export interface PaymentStatus {
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  method: PaymentMethod;
  amount?: number;
}

// Coupon Validation
export interface ValidateCouponRequest {
  code: string;
  subtotal_amount?: number;
}

export interface ValidateCouponResponse {
  success: boolean;
  data?: {
    coupon_info?: {
      code: string;
      type: 'percentage' | 'fixed';
      value: number;
      discount_amount: number;
    };
    discount_amount?: number;
    // Legacy fields for backward compatibility
    code?: string;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    minOrderAmount?: number;
    expiresAt?: string;
  };
  message?: string;
  error?: {
    code: string;
    details?: Array<{
      path: string;
      message: string;
      code: string;
    }>;
  };
}
