import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '@core/services/cart.service';
import { OrderService } from '@core/services/order.service';
import { PaymentService } from '@core/services/payment.service';
import { Observable, catchError, of, tap } from 'rxjs';
import { CreateOrderRequest, OrderResponse } from '../../orders/dto/order.dto';
import { CheckoutPaymentRequest, ValidateCouponResponse } from '../dto/payment.dto';

@Injectable({ providedIn: 'root' })
export class PaymentFacadeService {
  private readonly paymentService = inject(PaymentService);
  private readonly orderService = inject(OrderService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  // State signals
  readonly isProcessing = signal(false);
  readonly currentOrderId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly clientSecret = signal<string | null>(null);

  /**
   * Create an order from cart
   * @param checkoutData - Order creation data
   */
  createOrder(checkoutData: CreateOrderRequest): Observable<OrderResponse | null> {
    this.isProcessing.set(true);
    this.error.set(null);

    return this.orderService.createOrder(checkoutData).pipe(
      tap((response) => {
        if (response.success) {
          const orderId = response.data.id || (response.data as any)._id;
          this.currentOrderId.set(orderId || null);
        }
        this.isProcessing.set(false);
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to create order');
        this.isProcessing.set(false);
        return of(null);
      }),
    );
  }

  /**
   * Process payment for an order
   * @param request - Checkout payment request
   */
  processPayment(request: CheckoutPaymentRequest): Observable<any> {
    this.isProcessing.set(true);
    this.error.set(null);

    return this.paymentService.processCheckout(request).pipe(
      tap((response) => {
        if (response.success && response.data) {
          if (response.data.clientSecret) {
            this.clientSecret.set(response.data.clientSecret);
          } else if (response.data.paymentStatus === 'paid' || response.data.paymentStatus === 'pending') {
            this.cartService.getCart().subscribe(); // Refresh cart
            this.router.navigate(['/payment/success', request.orderId]);
          }
        }
        this.isProcessing.set(false);
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Payment failed');
        this.isProcessing.set(false);
        this.router.navigate(['/payment/failure', request.orderId], {
          queryParams: { message: err.error?.message },
        });
        return of(null);
      }),
    );
  }

  processGuestPayment(request: CheckoutPaymentRequest): Observable<any> {
    this.isProcessing.set(true);
    this.error.set(null);

    return this.paymentService.processGuestCheckout(request).pipe(
      tap((response) => {
        if (response.success && response.data) {
          if (response.data.clientSecret) {
            this.clientSecret.set(response.data.clientSecret);
          } else if (response.data.paymentStatus === 'paid' || response.data.paymentStatus === 'pending') {
            this.router.navigate(['/payment/success', request.orderId]);
          }
        }
        this.isProcessing.set(false);
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Payment failed');
        this.isProcessing.set(false);
        this.router.navigate(['/payment/failure', request.orderId], {
          queryParams: { message: err.error?.message },
        });
        return of(null);
      }),
    );
  }

  validateCoupon(code: string, subtotalAmount?: number): Observable<ValidateCouponResponse> {
    return this.paymentService.validateCoupon(code, subtotalAmount);
  }

  /**
   * Clear the facade state
   */
  clearState(): void {
    this.isProcessing.set(false);
    this.currentOrderId.set(null);
    this.error.set(null);
    this.clientSecret.set(null);
  }
}
