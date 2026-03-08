import { Injectable, inject } from '@angular/core';
import {
  CheckoutPaymentRequest,
  CheckoutPaymentResponse,
  ValidateCouponRequest,
  ValidateCouponResponse,
} from '@domains/payment/dto';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly api = inject(ApiService);

  /**
   * Process checkout payment
   * @param request - Checkout payment request with order ID, payment method
   */
  processCheckout(request: CheckoutPaymentRequest): Observable<CheckoutPaymentResponse> {
    return this.api.post<CheckoutPaymentResponse>('/payments/checkout', request);
  }

  /**
   * Process guest checkout payment (public endpoint)
   * @param request - Checkout payment request with order ID, payment method, guest email
   */
  processGuestCheckout(request: CheckoutPaymentRequest): Observable<CheckoutPaymentResponse> {
    return this.api.post<CheckoutPaymentResponse>('/payments/guest-checkout', request);
  }

  validateCoupon(code: string, subtotalAmount?: number): Observable<ValidateCouponResponse> {
    return this.api.post<ValidateCouponResponse>('/coupons/validate', {
      code,
      subtotal_amount: subtotalAmount,
    } as ValidateCouponRequest);
  }
}
