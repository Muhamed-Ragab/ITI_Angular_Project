import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { SellerService } from '../../services/seller.services';
import { SellerOrder, SellerUpdateStatus } from '../../dto/seller.dto';

@Component({
  selector: 'app-seller-orders',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, TitleCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-3 p-md-4">

      <!-- Header -->
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 class="fw-bold mb-0">My Orders</h4>
          <p class="text-muted small mb-0">Orders that contain your products</p>
        </div>
        <button class="btn btn-outline-secondary btn-sm rounded-pill px-3" (click)="load()">
          <i class="bi bi-arrow-clockwise me-1"></i>Refresh
        </button>
      </div>

      <!-- Alerts -->
      @if (successMsg()) {
        <div class="alert alert-success border-0 rounded-3 py-2 mb-3 d-flex gap-2">
          <i class="bi bi-check-circle-fill"></i>{{ successMsg() }}
        </div>
      }
      @if (error()) {
        <div class="alert alert-danger border-0 rounded-3 py-2 mb-3 d-flex gap-2">
          <i class="bi bi-exclamation-triangle-fill"></i>{{ error() }}
        </div>
      }

      <!-- Loading -->
      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border" style="color:#4ade80"></div>
          <p class="text-muted mt-2 small">Loading orders…</p>
        </div>

      <!-- Empty -->
      } @else if (orders().length === 0) {
        <div class="card border-0 shadow-sm rounded-4 text-center py-5">
          <i class="bi bi-bag d-block mb-3 text-muted" style="font-size:3rem"></i>
          <p class="text-muted mb-0">No orders yet for your products.</p>
        </div>

      <!-- Orders List -->
      } @else {
        <!-- Summary pills -->
        <div class="d-flex flex-wrap gap-2 mb-4">
          @for (s of statusSummary(); track s.label) {
            <span class="badge rounded-pill px-3 py-2 fw-normal fs-6"
              style="background:#f1f5f9;color:#475569">
              {{ s.label }}: <strong>{{ s.count }}</strong>
            </span>
          }
        </div>

        <div class="d-flex flex-column gap-3">
          @for (order of orders(); track order._id) {
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">

              <!-- Order header -->
              <div class="card-header border-0 py-3 px-4"
                style="background:#f8fafc">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">

                  <div class="d-flex align-items-center gap-4 flex-wrap">
                    <div>
                      <div class="text-muted" style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em">Order</div>
                      <div class="fw-bold font-monospace">#{{ order._id.slice(-8).toUpperCase() }}</div>
                    </div>
                    <div>
                      <div class="text-muted" style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em">Date</div>
                      <div class="small fw-semibold">{{ order.createdAt | date:'MMM d, y' }}</div>
                    </div>
                    <div>
                      <div class="text-muted" style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em">Total</div>
                      <div class="fw-bold text-success">\${{ order.total_price | number:'1.2-2' }}</div>
                    </div>
                    @if (order.shipping_address?.city) {
                      <div class="d-none d-md-block">
                        <div class="text-muted" style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em">Ship to</div>
                        <div class="small">{{ order.shipping_address?.city }}, {{ order.shipping_address?.country }}</div>
                      </div>
                    }
                  </div>

                  <div class="d-flex align-items-center gap-2 flex-wrap">
                    <!-- Status badge -->
                    <span class="badge rounded-pill px-3 py-2" [ngClass]="statusClass(order.status)">
                      <i class="bi me-1" [ngClass]="statusIcon(order.status)"></i>
                      {{ order.status | titlecase }}
                    </span>

                    <!-- Update dropdown — only for pending/processing -->
                    @if (order.status === 'pending' || order.status === 'processing') {
                      <div class="dropdown">
                        <button class="btn btn-sm btn-outline-secondary rounded-pill px-3 dropdown-toggle"
                          [disabled]="processingId() === order._id"
                          data-bs-toggle="dropdown">
                          @if (processingId() === order._id) {
                            <span class="spinner-border spinner-border-sm me-1"></span>
                          }
                          Update
                        </button>
                        <ul class="dropdown-menu shadow border-0 rounded-3 py-1">
                          <li>
                            <button class="dropdown-item py-2" (click)="updateStatus(order._id, 'shipped')">
                              <i class="bi bi-truck me-2 text-primary"></i>Mark as Shipped
                            </button>
                          </li>
                          <li>
                            <button class="dropdown-item py-2" (click)="updateStatus(order._id, 'delivered')">
                              <i class="bi bi-check-circle me-2 text-success"></i>Mark as Delivered
                            </button>
                          </li>
                          <li><hr class="dropdown-divider my-1"></li>
                          <li>
                            <button class="dropdown-item py-2 text-danger" (click)="updateStatus(order._id, 'cancelled')">
                              <i class="bi bi-x-circle me-2"></i>Cancel Order
                            </button>
                          </li>
                        </ul>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Order items -->
              <div class="card-body p-0">
                @for (item of order.items; track $index) {
                  <div class="d-flex align-items-center gap-3 px-4 py-3"
                    style="border-bottom:1px solid #f1f5f9">
                    <img
                      [src]="item.images?.[0] || item.product_id?.images?.[0] || 'https://placehold.co/48x48/e2e8f0/94a3b8?text=?'"
                      class="rounded-3 border flex-shrink-0"
                      style="width:48px;height:48px;object-fit:cover"
                      (error)="onImgError($event)" />
                    <div class="flex-grow-1 min-width-0">
                      <div class="fw-semibold text-truncate">
                        {{ item.title || item.product_id?.title || 'Product' }}
                      </div>
                      <div class="text-muted small">
                        Qty: {{ item.quantity }} × \${{ item.price | number:'1.2-2' }}
                      </div>
                    </div>
                    <div class="fw-bold flex-shrink-0">
                      \${{ ((item.price * item.quantity)) | number:'1.2-2' }}
                    </div>
                  </div>
                }
              </div>

            </div>
          }
        </div>
      }

    </div>
  `,
})
export class SellerOrdersComponent implements OnInit {
  private readonly sellerService = inject(SellerService);

  readonly orders       = signal<SellerOrder[]>([]);
  readonly isLoading    = signal(false);
  readonly processingId = signal<string | null>(null);
  readonly error        = signal<string | null>(null);
  readonly successMsg   = signal<string | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.sellerService.getMyOrders().subscribe({
      next: (res) => { this.orders.set(res.data.orders); this.isLoading.set(false); },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load orders.');
        this.isLoading.set(false);
      },
    });
  }

  statusSummary(): { label: string; count: number }[] {
    const all = this.orders();
    const count = (s: string) => all.filter(o => o.status === s).length;
    return [
      { label: 'Total',     count: all.length },
      { label: 'Pending',   count: count('pending') },
      { label: 'Shipped',   count: count('shipped') },
      { label: 'Delivered', count: count('delivered') },
      { label: 'Cancelled', count: count('cancelled') },
    ].filter(s => s.label === 'Total' || s.count > 0);
  }

  updateStatus(orderId: string, status: SellerUpdateStatus): void {
    this.processingId.set(orderId);
    this.error.set(null);
    this.sellerService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.processingId.set(null);
        this.flash(`Order marked as ${status}.`);
        this.load();
      },
      error: (err) => {
        this.processingId.set(null);
        this.error.set(err?.error?.message ?? 'Failed to update order status.');
      },
    });
  }

  statusClass(status: string): Record<string, boolean> {
    return {
      'bg-warning text-dark': status === 'pending',
      'bg-info text-white':   status === 'processing',
      'bg-primary':           status === 'shipped',
      'bg-success':           status === 'delivered',
      'bg-danger':            status === 'cancelled',
    };
  }

  statusIcon(status: string): string {
    const map: Record<string, string> = {
      pending:   'bi-clock',
      processing:'bi-gear',
      shipped:   'bi-truck',
      delivered: 'bi-check-circle-fill',
      cancelled: 'bi-x-circle',
    };
    return map[status] ?? 'bi-circle';
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/e2e8f0/94a3b8?text=?';
  }

  private flash(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 4000);
  }
}