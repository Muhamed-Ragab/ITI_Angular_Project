import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CreateOrderRequest,
  GuestCheckoutRequest,
  OrderDetailResponse,
  OrderListResponse,
  OrderResponse,
} from '@domains/orders/dto';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);

  /**
   * Create an order from the current cart
   * @param request - Order creation request with shipping address index, coupon, payment method
   */
  createOrder(request: CreateOrderRequest): Observable<OrderResponse> {
    return this.api.post<OrderResponse>('/orders', request);
  }

  /**
   * Guest checkout without authentication
   * @param request - Guest checkout request with guest info, shipping address, items
   */
  guestCheckout(request: GuestCheckoutRequest): Observable<OrderResponse> {
    console.log('=== OrderService.guestCheckout ===');
    console.log('Request:', request);
    return this.api.post<OrderResponse>('/orders/guest', request).pipe(
      tap((response) => {
        console.log('=== Guest Checkout Response ===');
        console.log('Response:', response);
        console.log('Response data:', response.data);
        console.log('Order _id:', (response.data as any)._id);
        console.log('Order id:', (response.data as any).id);
      }),
    );
  }

  /**
   * Get the authenticated user's orders
   * @param params - Optional filters: status, page, limit
   */
  getMyOrders(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<OrderListResponse> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    }
    return this.api.get<OrderListResponse>('/orders/me', httpParams);
  }

  /**
   * Get order details by ID
   * @param orderId - The order ID to fetch
   */
  getOrderById(orderId: string): Observable<OrderDetailResponse> {
    return this.api.get<OrderDetailResponse>(`/orders/${orderId}`);
  }
}
