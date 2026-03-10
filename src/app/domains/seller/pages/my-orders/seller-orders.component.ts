import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SellerService } from '../../services/seller.services';
import { SellerOrder, SellerUpdateStatus } from '../../dto/seller.dto';

@Component({
  selector: 'app-seller-orders',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4">

      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 class="fw-bold mb-0">My Orders</h4>
          <p class="text-muted small mb-0">Orders containing your products</p>
        </div>
        <button class="btn btn-outline-secondary btn-sm rounded-pill" (click)="load()">
          <i class="bi bi-arrow-clockwise me-1"></i>Refresh
        </button>
      </div>

      @if (successMsg()) {
        <div class="alert alert-success border-0 rounded-3 py-2 mb-3">
          <i class="bi bi-check-circle-fill me-2"></i>{{ successMsg() }}
        </div>
      }
      @if (error()) {
        <div class="alert alert-danger border-0 rounded-3 py-2 mb-3">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ error() }}
        </div>
      }

      @if (isLoading()) {
        <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
      } @else if (orders().length === 0) {
        <div class="card border-0 shadow-sm rounded-4 text-center py-5 text-muted">
          <i class="bi bi-bag d-block mb-2" style="font-size:2.5rem"></i>
          <p class="mb-0">No orders yet.</p>
        </div>
      } @else {
        <div class="d-flex flex-column gap-3">
          @for (order of orders(); track order._id) {
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">

              <!-- Order header -->
              <div class="card-header border-0 d-flex justify-content-between align-items-center flex-wrap gap-2"
                style="background:#f8fafc">
                <div class="d-flex align-items-center gap-3">
                  <div>
                    <div class="fw-semibold small text-muted">ORDER</div>
                    <div class="fw-bold font-monospace">#{{ order._id.slice(-8).toUpperCase() }}</div>
                  </div>
                  <div>
                    <div class="fw-semibold small text-muted">DATE</div>
                    <div class="small">{{ order.createdAt | date:'MMM d, y' }}</div>
                  </div>
                  <div>
                    <div class="fw-semibold small text-muted">TOTAL</div>
                    <div class="fw-bold text-success">\${{ order.total_price | number:'1.2-2' }}</div>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-2">
                  <!-- Status badge -->
                  <span class="badge rounded-pill px-3 py-2" [ngClass]="statusClass(order.status)">
                    {{ order.status | titlecase }}
                  </span>

                  <!-- Status update dropdown (only for pending/processing) -->
                  @if (order.status === 'pending' || order.status === 'processing') {
                    <div class="dropdown">
                      <button class="btn btn-sm btn-outline-secondary rounded-pill dropdown-toggle"
                        [disabled]="processingId() === order._id"
                        data-bs-toggle="dropdown">
                        @if (processingId() === order._id) {
                          <span class="spinner-border spinner-border-sm"></span>
                        } @else {
                          Update Status
                        }
                      </button>
                      <ul class="dropdown-menu shadow border-0 rounded-3">
                        <li>
                          <button class="dropdown-item" (click)="updateStatus(order._id, 'shipped')">
                            <i class="bi bi-truck me-2 text-info"></i>Mark as Shipped
                          </button>
                        </li>
                        <li>
                          <button class="dropdown-item" (click)="updateStatus(order._id, 'delivered')">
                            <i class="bi bi-check-circle me-2 text-success"></i>Mark as Delivered
                          </button>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                          <button class="dropdown-item text-danger" (click)="updateStatus(order._id, 'cancelled')">
                            <i class="bi bi-x-circle me-2"></i>Cancel Order
                          </button>
                        </li>
                      </ul>
                    </div>
                  }
                </div>
              </div>

              <!-- Order items -->
              <div class="card-body p-0">
                @for (item of order.items; track $index) {
                  <div class="d-flex align-items-center gap-3 px-4 py-3 border-bottom">
                    <img
                      [src]="item.images?.[0] || item.product_id?.images?.[0] || 'https://placehold.co/48x48/e2e8f0/94a3b8?text=?'"
                      class="rounded-3" style="width:48px;height:48px;object-fit:cover"
                      (error)="onImgError($event)" />
                    <div class="flex-grow-1">
                      <div class="fw-semibold">{{ item.title || item.product_id?.title }}</div>
                      <div class="text-muted small">Qty: {{ item.quantity }}</div>
                    </div>
                    <div class="fw-bold">\${{ (item.price * item.quantity) | number:'1.2-2' }}</div>
                  </div>
                }
              </div>

              <!-- Shipping address -->
              @if (order.shipping_address) {
                <div class="card-footer bg-transparent border-0 px-4 py-2">
                  <small class="text-muted">
                    <i class="bi bi-geo-alt me-1"></i>
                    {{ order.shipping_address.street }}, {{ order.shipping_address.city }}, {{ order.shipping_address.country }}
                  </small>
                </div>
              }

            </div>
          }
        </div>
      }

    </div>
  `,
})
export class SellerOrdersComponent implements OnInit {
  private readonly sellerService = inject(SellerService);

  readonly orders      = signal<SellerOrder[]>([]);
  readonly isLoading   = signal(false);
  readonly processingId = signal<string | null>(null);
  readonly error       = signal<string | null>(null);
  readonly successMsg  = signal<string | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.sellerService.getMyOrders().subscribe({
      next: (res) => { this.orders.set(res.data); this.isLoading.set(false); },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load orders.');
        this.isLoading.set(false);
      },
    });
  }

  updateStatus(orderId: string, status: SellerUpdateStatus): void {
    this.processingId.set(orderId);
    this.sellerService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.processingId.set(null);
        this.flash(`Order marked as ${status}.`);
        this.load();
      },
      error: (err) => {
        this.processingId.set(null);
        this.error.set(err?.error?.message ?? 'Failed to update status.');
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

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/e2e8f0/94a3b8?text=?';
  }

  private flash(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 3500);
  }
}
