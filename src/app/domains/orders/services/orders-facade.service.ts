import { Injectable, inject, signal } from '@angular/core';
import { OrderService } from '@core/services/order.service';
import { Observable, catchError, of, tap } from 'rxjs';
import {
  CreateOrderRequest,
  GuestCheckoutRequest,
  Order,
  OrderDetailResponse,
  OrderListResponse,
  OrderResponse,
} from '../dto/order.dto';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class OrdersFacadeService {
  private readonly orderService = inject(OrderService);

  // State signals
  readonly orders = signal<Order[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentOrder = signal<Order | null>(null);
  readonly statusFilter = signal('');
  readonly isProcessingCheckout = signal(false);
  readonly pagination = signal<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  /**
   * Get user's orders with optional filters and pagination
   * @param params - Optional filters: status, page, limit
   */
  getOrders$(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<OrderListResponse | null> {
    this.isLoading.set(true);
    this.error.set(null);

    const currentStatus = this.statusFilter() || params?.status;
    const requestParams: any = {
      page: params?.page ?? this.pagination().page,
      limit: params?.limit ?? 10,
    };

    // Only add status if it's not empty
    if (currentStatus && currentStatus.trim() !== '') {
      requestParams.status = currentStatus;
    }

    return this.orderService.getMyOrders(requestParams).pipe(
      tap((response) => {
        if (response.success) {
          this.orders.set(response.data.orders);
          this.pagination.set(response.data.pagination);
        }
        this.isLoading.set(false);
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to load orders');
        this.isLoading.set(false);
        return of(null);
      }),
    );
  }

  /**
   * Load orders with current state
   */
  loadOrders(): void {
    this.getOrders$().subscribe();
  }

  /**
   * Get a single order by ID
   * @param orderId - The order ID to fetch
   */
  getOrderById$(orderId: string): Observable<OrderDetailResponse | null> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.orderService.getOrderById(orderId).pipe(
      tap((response) => {
        if (response.success) {
          this.currentOrder.set(response.data);
        }
        this.isLoading.set(false);
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to load order');
        this.isLoading.set(false);
        return of(null);
      }),
    );
  }

  /**
   * Create order for authenticated users
   * @param request - Order creation request
   */
  createOrder$(request: Omit<CreateOrderRequest, 'items'>): Observable<OrderResponse | null> {
    this.isProcessingCheckout.set(true);
    this.error.set(null);

    return this.orderService.createOrder(request).pipe(
      tap((response) => {
        if (response.success) {
          this.currentOrder.set(response.data);
        }
        this.isProcessingCheckout.set(false);
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to create order');
        this.isProcessingCheckout.set(false);
        return of(null);
      }),
    );
  }

  /**
   * Guest checkout without authentication
   * @param request - Guest checkout request
   */
  guestCheckout$(request: GuestCheckoutRequest): Observable<OrderResponse | null> {
    this.isProcessingCheckout.set(true);
    this.error.set(null);

    return this.orderService.guestCheckout(request).pipe(
      tap((response) => {
        if (response.success) {
          this.currentOrder.set(response.data);
        }
        this.isProcessingCheckout.set(false);
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to create guest order');
        this.isProcessingCheckout.set(false);
        return of(null);
      }),
    );
  }

  /**
   * Filter orders by status
   * @param status - Status to filter by (empty string for all)
   */
  filterByStatus(status: string): void {
    this.statusFilter.set(status);
    this.pagination.update((p) => ({ ...p, page: 1 }));
    this.loadOrders();
  }

  /**
   * Navigate to a specific page
   * @param page - Page number to navigate to
   */
  goToPage(page: number): void {
    this.pagination.update((p) => ({ ...p, page }));
    this.loadOrders();
  }

  /**
   * Get page numbers for pagination UI
   */
  getPageNumbers(): number[] {
    const pages = this.pagination().pages;
    const current = this.pagination().page;
    const result: number[] = [];

    const start = Math.max(1, current - 2);
    const end = Math.min(pages, current + 2);

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    return result;
  }

  /**
   * Clear the facade state
   */
  clearState(): void {
    this.orders.set([]);
    this.isLoading.set(false);
    this.error.set(null);
    this.currentOrder.set(null);
    this.statusFilter.set('');
    this.isProcessingCheckout.set(false);
    this.pagination.set({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    });
  }
}
