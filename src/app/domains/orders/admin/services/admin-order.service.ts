import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Observable } from 'rxjs';
import {
  AdminOrderActionResponse,
  AdminOrderHistoryResponse,
  AdminOrderListResponse,
  AdminOrderResponse,
  OrderFilters,
} from '../dto';
import { CreateOrderRequest } from '../dto/create-order-request.dto';
import { UpdateOrderStatusRequest } from '../dto/update-order-status.dto';
import { UpdateOrderRequest } from '../dto/update-order.dto';

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private readonly api = inject(ApiService);

  /**
   * GET /orders/admin - paginated list with filters
   */
  getOrders(filters: OrderFilters = {}): Observable<AdminOrderListResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });
    return this.api.get<AdminOrderListResponse>('/orders', params);
  }

  /**
   * GET /orders/admin/:id - single order details
   */
  getOrderById(id: string): Observable<AdminOrderResponse> {
    return this.api.get<AdminOrderResponse>(`/orders/${id}`);
  }

  /**
   * POST /orders/admin - create new order
   */
  createOrder(request: CreateOrderRequest): Observable<AdminOrderActionResponse> {
    return this.api.post<AdminOrderActionResponse>('/orders', request);
  }

  /**
   * PUT /orders/admin/:id/status - update order status
   */
  updateOrderStatus(id: string, request: UpdateOrderStatusRequest): Observable<AdminOrderResponse> {
    return this.api.put<AdminOrderResponse>(`/orders/${id}/status`, request);
  }

  /**
   * PUT /orders/admin/:id - update order details
   */
  updateOrder(id: string, request: UpdateOrderRequest): Observable<AdminOrderResponse> {
    return this.api.put<AdminOrderResponse>(`/orders/${id}`, request);
  }

  /**
   * POST /orders/admin/:id/cancel - cancel order
   */
  cancelOrder(id: string, reason: string, processRefund: boolean): Observable<AdminOrderResponse> {
    return this.api.post<AdminOrderResponse>(`/orders/${id}/cancel`, {
      reason,
      processRefund,
    });
  }

  /**
   * GET /orders/admin/:id/history - order status history
   */
  getOrderHistory(id: string): Observable<AdminOrderHistoryResponse> {
    return this.api.get<AdminOrderHistoryResponse>(`/orders/${id}/history`);
  }

  /**
   * POST /orders/admin/export - export orders to file
   */
  exportOrders(filters: OrderFilters, format: 'csv' | 'excel' | 'pdf'): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });
    return this.api.get('/orders/export', params);
  }
}
