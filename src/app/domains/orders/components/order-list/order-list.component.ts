import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrdersFacadeService } from '@domains/orders/services/orders-facade.service';
import { formatCurrency, formatRelativeTime } from '@core/utils';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <h2 class="mb-4">My Orders</h2>

      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (error()) {
        <div class="alert alert-danger">
          {{ error() }}
          <button class="btn btn-link" (click)="loadOrders()">Try again</button>
        </div>
      } @else if (orders().length === 0) {
        <div class="alert alert-info">
          You haven't placed any orders yet.
          <a routerLink="/products">Start shopping</a>
        </div>
      } @else {
        <!-- Filter -->
        <div class="mb-4">
          <div class="btn-group">
            <button
              class="btn btn-outline-primary"
              [class.active]="!statusFilter()"
              (click)="filterByStatus('')"
            >
              All
            </button>
            <button
              class="btn btn-outline-primary"
              [class.active]="statusFilter() === 'pending'"
              (click)="filterByStatus('pending')"
            >
              Pending
            </button>
            <button
              class="btn btn-outline-primary"
              [class.active]="statusFilter() === 'processing'"
              (click)="filterByStatus('processing')"
            >
              Processing
            </button>
            <button
              class="btn btn-outline-primary"
              [class.active]="statusFilter() === 'shipped'"
              (click)="filterByStatus('shipped')"
            >
              Shipped
            </button>
            <button
              class="btn btn-outline-primary"
              [class.active]="statusFilter() === 'delivered'"
              (click)="filterByStatus('delivered')"
            >
              Delivered
            </button>
          </div>
        </div>

        <!-- Orders List -->
        <div class="row">
          @for (order of orders(); track order.id) {
            <div class="col-12 mb-3">
              <div class="card">
                <div class="card-body">
                  <div class="row align-items-center">
                    <!--="row align-items Order Info -->
                    <div class="col-md-3">
                      <div class="fw-bold">Order #{{ order.orderNumber }}</div>
                      <small class="text-muted">{{ formatOrderDate(order.createdAt) }}</small>
                    </div>

                    <!-- Items Count -->
                    <div class="col-md-2">
                      <small class="text-muted d-block">Items</small>
                      <span>{{ order.items.length }} product(s)</span>
                    </div>

                    <!-- Total -->
                    <div class="col-md-2">
                      <small class="text-muted d-block">Total</small>
                      <span class="fw-bold">EGP {{ order.total.toFixed(2) }}</span>
                    </div>

                    <!-- Status -->
                    <div class="col-md-2">
                      <small class="text-muted d-block">Status</small>
                      <span [class]="getStatusClass(order.status)">
                        {{ order.status | titlecase }}
                      </span>
                    </div>

                    <!-- Actions -->
                    <div class="col-md-3 text-md-end">
                      <a
                        [routerLink]="['/orders', order.id]"
                        class="btn btn-sm btn-outline-primary"
                      >
                        View Details
                      </a>
                    </div>
                  </div>

                  <!-- Tracking Info -->
                  @if (order.tracking?.number) {
                    <div class="mt-3 pt-3 border-top">
                      <small class="text-muted">
                        <i class="bi bi-truck me-2"></i>
                        Tracking: {{ order.tracking?.carrier }} - {{ order.tracking?.number }}
                      </small>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (pagination().pages > 1) {
          <nav aria-label="Orders pagination" class="mt-4">
            <ul class="pagination justify-content-center">
              <li class="page-item" [class.disabled]="pagination().page === 1">
                <button class="page-link" (click)="goToPage(pagination().page - 1)">
                  Previous
                </button>
              </li>
              @for (page of getPageNumbers(); track page) {
                <li class="page-item" [class.active]="page === pagination().page">
                  <button class="page-link" (click)="goToPage(page)">{{ page }}</button>
                </li>
              }
              <li class="page-item" [class.disabled]="pagination().page === pagination().pages">
                <button class="page-link" (click)="goToPage(pagination().page + 1)">Next</button>
              </li>
            </ul>
          </nav>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListComponent implements OnInit {
  private readonly ordersFacade = inject(OrdersFacadeService);

  readonly orders = computed(() => this.ordersFacade.orders());
  readonly isLoading = computed(() => this.ordersFacade.isLoading());
  readonly error = computed(() => this.ordersFacade.error() || '');
  readonly statusFilter = computed(() => this.ordersFacade.statusFilter());
  readonly pagination = computed(() => this.ordersFacade.pagination());

  ngOnInit(): void {
    this.ordersFacade.loadOrders();
  }

  loadOrders(): void {
    this.ordersFacade.loadOrders();
  }

  filterByStatus(status: string): void {
    this.ordersFacade.filterByStatus(status);
  }

  goToPage(page: number): void {
    this.ordersFacade.goToPage(page);
  }

  getPageNumbers(): number[] {
    return this.ordersFacade.getPageNumbers();
  }

  formatOrderDate(dateString: string): string {
    return formatRelativeTime(dateString, { prefix: 'ordered' });
  }

  formatCurrency(amount: number): string {
    return formatCurrency(amount);
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'badge bg-warning',
      paid: 'badge bg-info',
      processing: 'badge bg-primary',
      shipped: 'badge bg-info',
      delivered: 'badge bg-success',
      cancelled: 'badge bg-danger',
    };
    return classes[status] || 'badge bg-secondary';
  }
}
