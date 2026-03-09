import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { AdminOrderService } from './admin-order.service';
import {
  AdminOrder,
  AdminOrderPagination,
  OrderFilters,
  OrderHistory,
} from '../dto';
import { CreateOrderRequest } from '../dto/create-order-request.dto';
import { UpdateOrderStatusRequest } from '../dto/update-order-status.dto';
import { UpdateOrderRequest } from '../dto/update-order.dto';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class AdminOrderFacadeService {
  private readonly orderService = inject(AdminOrderService);

  // State signals
  readonly orders = signal<AdminOrder[]>([]);
  readonly currentOrder = signal<AdminOrder | null>(null);
  readonly orderHistory = signal<OrderHistory[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pagination = signal<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filters signal
  readonly filters = signal<OrderFilters>({});

  /**
   * Load orders with filters
   */
  getOrders$(filters?: OrderFilters): Observable<AdminOrder[] | null> {
    this.isLoading.set(true);
    this.error.set(null);

    const currentFilters = { ...this.filters(), ...filters };
    if (filters) {
      this.filters.set(currentFilters);
    }

    // Add pagination parameters to filters
    const filtersWithPagination = {
      ...currentFilters,
      page: this.pagination().page,
      limit: this.pagination().limit,
    };

    return this.orderService.getOrders(filtersWithPagination).pipe(
      map((response) => {
        if (response.success) {
          this.orders.set(response.data.orders);
          this.pagination.set(response.data.pagination);
        }
        this.isLoading.set(false);
        return response.success ? response.data.orders : null;
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to load orders');
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Load orders with current state
   */
  loadOrders(): void {
    this.getOrders$().subscribe();
  }

  /**
   * Get single order by ID
   */
  getOrderById$(id: string): Observable<AdminOrder | null> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.orderService.getOrderById(id).pipe(
      map((response) => {
        if (response.success) {
          this.currentOrder.set(response.data);
        }
        this.isLoading.set(false);
        return response.success ? response.data : null;
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to load order');
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Create new order
   */
  createOrder$(request: CreateOrderRequest): Observable<AdminOrder | null> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.orderService.createOrder(request).pipe(
      map((response) => {
        if (response.success && response.data) {
          this.currentOrder.set(response.data);
          this.loadOrders(); // Refresh list
        }
        this.isLoading.set(false);
        return response.success && response.data ? response.data : null;
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to create order');
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Update order status
   */
  updateOrderStatus$(
    id: string,
    request: UpdateOrderStatusRequest
  ): Observable<AdminOrder | null> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.orderService.updateOrderStatus(id, request).pipe(
      map((response) => {
        if (response.success) {
          this.currentOrder.set(response.data);
          this.loadOrders(); // Refresh list
        }
        this.isLoading.set(false);
        return response.success ? response.data : null;
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to update order status');
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Update order details
   */
  updateOrder$(id: string, request: UpdateOrderRequest): Observable<AdminOrder | null> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.orderService.updateOrder(id, request).pipe(
      map((response) => {
        if (response.success) {
          this.currentOrder.set(response.data);
          this.loadOrders(); // Refresh list
        }
        this.isLoading.set(false);
        return response.success ? response.data : null;
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to update order');
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Cancel order
   */
  cancelOrder$(
    id: string,
    reason: string,
    processRefund: boolean
  ): Observable<AdminOrder | null> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.orderService.cancelOrder(id, reason, processRefund).pipe(
      map((response) => {
        if (response.success) {
          this.currentOrder.set(response.data);
          this.loadOrders(); // Refresh list
        }
        this.isLoading.set(false);
        return response.success ? response.data : null;
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to cancel order');
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Get order history
   */
  getOrderHistory$(id: string): Observable<OrderHistory[] | null> {
    return this.orderService.getOrderHistory(id).pipe(
      map((response) => {
        if (response.success) {
          this.orderHistory.set(response.data);
        }
        return response.success ? response.data : null;
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to load order history');
        return of(null);
      })
    );
  }

  /**
   * Export orders
   */
  exportOrders$(format: 'csv' | 'excel' | 'pdf'): void {
    this.isLoading.set(true);
    this.orderService
      .exportOrders(this.filters(), format)
      .pipe(
        catchError((err) => {
          this.error.set(err.error?.message || 'Failed to export orders');
          this.isLoading.set(false);
          return of(null);
        })
      )
      .subscribe((blob) => {
        this.isLoading.set(false);
        if (blob) {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `orders-${new Date().toISOString()}.${format}`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      });
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    this.pagination.update((p) => ({ ...p, page }));
    this.loadOrders();
  }

  /**
   * Update filters and reload
   */
  setFilters(newFilters: OrderFilters): void {
    this.filters.set(newFilters);
    this.pagination.update((p) => ({ ...p, page: 1 })); // Reset to page 1
    this.loadOrders();
  }

  /**
   * Clear filters
   */
  clearFilters(): void {
    this.filters.set({});
    this.pagination.update((p) => ({ ...p, page: 1 }));
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
   * Clear facade state
   */
  clearState(): void {
    this.orders.set([]);
    this.currentOrder.set(null);
    this.orderHistory.set([]);
    this.isLoading.set(false);
    this.error.set(null);
    this.pagination.set({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    });
    this.filters.set({});
  }
}
