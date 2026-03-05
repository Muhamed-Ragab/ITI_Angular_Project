import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { formatCurrency, formatRelativeTime } from '@core/utils';
import { GuestOrderItem, OrderItem } from '@domains/orders/dto';
import { OrdersFacadeService } from '../../services/orders-facade.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <a routerLink="/orders" class="btn btn-link mb-3">
        <i class="bi bi-arrow-left"></i> Back to Orders
      </a>

      @if (ordersFacade.isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (ordersFacade.error()) {
        <div class="alert alert-danger">
          {{ ordersFacade.error() }}
          <a routerLink="/orders" class="btn btn-link">Back to Orders</a>
        </div>
      } @else if (ordersFacade.currentOrder()) {
        <div class="row">
          <div class="col-lg-8">
            <!-- Order Header -->
            <div class="card mb-4">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 class="mb-1">Order #{{ ordersFacade.currentOrder()!.orderNumber }}</h4>
                    <small class="text-muted"
                      >Placed on {{ formatDate(ordersFacade.currentOrder()!.createdAt) }}</small
                    >
                  </div>
                  <span [class]="getStatusClass(ordersFacade.currentOrder()!.status)">
                    {{ ordersFacade.currentOrder()!.status | titlecase }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Order Timeline -->
            <div class="card mb-4">
              <div class="card-body">
                <h5 class="card-title">Order Status</h5>
                <div class="order-timeline">
                  <div class="timeline-item" [class.active]="isStatusActive('pending')">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <div class="fw-medium">Order Placed</div>
                      <small class="text-muted">{{ getStatusDateFormatted('pending') }}</small>
                    </div>
                  </div>
                  <div class="timeline-item" [class.active]="isStatusActive('paid')">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <div class="fw-medium">Payment Confirmed</div>
                      <small class="text-muted">{{ getStatusDateFormatted('paid') }}</small>
                    </div>
                  </div>
                  <div class="timeline-item" [class.active]="isStatusActive('processing')">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <div class="fw-medium">Processing</div>
                      <small class="text-muted">{{ getStatusDateFormatted('processing') }}</small>
                    </div>
                  </div>
                  <div class="timeline-item" [class.active]="isStatusActive('shipped')">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <div class="fw-medium">Shipped</div>
                      <small class="text-muted">{{ getStatusDateFormatted('shipped') }}</small>
                    </div>
                  </div>
                  <div class="timeline-item" [class.active]="isStatusActive('delivered')">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <div class="fw-medium">Delivered</div>
                      <small class="text-muted">{{ getStatusDateFormatted('delivered') }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div class="card mb-4">
              <div class="card-body">
                <h5 class="card-title">Order Items</h5>
                @for (item of ordersFacade.currentOrder()!.items; track getItemId(item)) {
                  <div class="d-flex align-items-center mb-3">
                    <div class="shrink-0">
                      @if (getItemImage(item)) {
                        <img
                          [src]="getItemImage(item)!"
                          [alt]="getItemName(item)"
                          class="rounded"
                          style="width: 80px; height: 80px; object-fit: cover;"
                        />
                      } @else {
                        <div
                          class="bg-light rounded d-flex align-items-center justify-content-center"
                          style="width: 80px; height: 80px;"
                        >
                          <i class="bi bi-image text-muted"></i>
                        </div>
                      }
                    </div>
                    <div class="grow ms-3">
                      <div class="fw-medium">{{ getItemName(item) }}</div>
                      <small class="text-muted"
                        >{{ formatCurrency(getItemPrice(item)) }} x {{ item.quantity }}</small
                      >
                    </div>
                    <div class="text-end">
                      <div class="fw-medium">{{ formatCurrency(getItemSubtotal(item)) }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Shipping Address -->
            <div class="card mb-4">
              <div class="card-body">
                <h5 class="card-title">Shipping Address</h5>
                <address class="mb-0">
                  {{ ordersFacade.currentOrder()!.shippingAddress.street }}<br />
                  {{ ordersFacade.currentOrder()!.shippingAddress.city }},
                  {{ ordersFacade.currentOrder()!.shippingAddress.state }}<br />
                  {{ ordersFacade.currentOrder()!.shippingAddress.country }}
                  {{ ordersFacade.currentOrder()!.shippingAddress.zip }}
                </address>
              </div>
            </div>
          </div>

          <!-- Order Summary Sidebar -->
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Order Summary</h5>

                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Subtotal</span>
                  <span>{{ formatCurrency(ordersFacade.currentOrder()!.subtotal) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Tax</span>
                  <span>{{ formatCurrency(ordersFacade.currentOrder()!.tax) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Shipping</span>
                  <span>{{ formatCurrency(ordersFacade.currentOrder()!.shipping) }}</span>
                </div>
                @if (hasDiscount()) {
                  <div class="d-flex justify-content-between mb-2 text-success">
                    <span>Discount</span>
                    <span>-{{ getDiscountValue() }}</span>
                  </div>
                }
                <hr />
                <div class="d-flex justify-content-between fw-bold fs-5">
                  <span>Total</span>
                  <span>{{ formatCurrency(ordersFacade.currentOrder()!.total) }}</span>
                </div>

                @if (ordersFacade.currentOrder()!.payment) {
                  <hr />
                  <h6>Payment Information</h6>
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Method</span>
                    <span class="text-capitalize">{{
                      ordersFacade.currentOrder()!.payment!.method
                    }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Status</span>
                    <span
                      [class]="getPaymentStatusClass(ordersFacade.currentOrder()!.payment!.status)"
                    >
                      {{ ordersFacade.currentOrder()!.payment!.status | titlecase }}
                    </span>
                  </div>
                  @if (ordersFacade.currentOrder()!.payment!.transactionId) {
                    <div class="d-flex justify-content-between">
                      <span class="text-muted">Transaction ID</span>
                      <small class="text-break">{{
                        ordersFacade.currentOrder()!.payment!.transactionId
                      }}</small>
                    </div>
                  }
                }

                @if (ordersFacade.currentOrder()!.tracking?.number) {
                  <hr />
                  <h6>Tracking Information</h6>
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Carrier</span>
                    <span>{{ ordersFacade.currentOrder()!.tracking!.carrier }}</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">Tracking Number</span>
                    <span class="text-break">{{
                      ordersFacade.currentOrder()!.tracking!.number
                    }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .order-timeline {
        position: relative;
        padding-left: 30px;
      }
      .timeline-item {
        position: relative;
        padding-bottom: 20px;
        opacity: 0.5;
      }
      .timeline-item:last-child {
        padding-bottom: 0;
      }
      .timeline-item.active {
        opacity: 1;
      }
      .timeline-dot {
        position: absolute;
        left: -30px;
        top: 0;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: #dee2e6;
        border: 2px solid #fff;
      }
      .timeline-item.active .timeline-dot {
        background-color: #198754;
      }
      .timeline-item::before {
        content: '';
        position: absolute;
        left: -24px;
        top: 16px;
        bottom: 0;
        width: 2px;
        background-color: #dee2e6;
      }
      .timeline-item:last-child::before {
        display: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly ordersFacade = inject(OrdersFacadeService);

  ngOnInit(): void {
    this.loadOrder();
  }

  loadOrder(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) {
      this.ordersFacade.error.set('Order not found');
      return;
    }

    this.ordersFacade.getOrderById$(orderId).subscribe();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  getPaymentStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'text-warning',
      paid: 'text-success',
      failed: 'text-danger',
    };
    return classes[status] || '';
  }

  isStatusActive(status: string): boolean {
    const order = this.ordersFacade.currentOrder();
    if (!order) return false;

    const statusOrder = ['pending', 'paid', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const statusIndex = statusOrder.indexOf(status);

    return statusIndex <= currentIndex;
  }

  getStatusDate(status: string): string | null {
    const timeline = this.ordersFacade.currentOrder()?.status_timeline;
    if (!timeline) return null;

    const entry = timeline.find((t) => t.status === status);
    return entry?.timestamp || null;
  }

  getStatusDateFormatted(status: string): string {
    const dateStr = this.getStatusDate(status);
    if (!dateStr) return '';
    return formatRelativeTime(dateStr, { prefix: 'updated' });
  }

  hasDiscount(): boolean {
    const discount = this.ordersFacade.currentOrder()?.discount;
    return discount !== undefined && discount > 0;
  }

  formatCurrency(amount: number): string {
    return formatCurrency(amount);
  }

  isGuestOrderItem(item: OrderItem | GuestOrderItem): item is GuestOrderItem {
    return 'product' in item && 'title' in item;
  }

  isOrderItem(item: OrderItem | GuestOrderItem): item is OrderItem {
    return 'productId' in item && 'name' in item;
  }

  getItemName(item: OrderItem | GuestOrderItem): string {
    if (this.isOrderItem(item)) {
      return item.name;
    }
    return item.title;
  }

  getItemPrice(item: OrderItem | GuestOrderItem): number {
    return item.price;
  }

  getItemSubtotal(item: OrderItem | GuestOrderItem): number {
    if (this.isOrderItem(item) && item.subtotal !== undefined) {
      return item.subtotal;
    }
    return item.price * item.quantity;
  }

  getItemImage(item: OrderItem | GuestOrderItem): string | undefined {
    if (this.isOrderItem(item)) {
      return item.image;
    }
    return undefined;
  }

  getItemId(item: OrderItem | GuestOrderItem): string {
    if (this.isOrderItem(item)) {
      return item.productId;
    }
    return item.product;
  }

  getDiscountValue(): string {
    const discount = this.ordersFacade.currentOrder()?.discount;
    if (!discount) return this.formatCurrency(0);
    return this.formatCurrency(discount);
  }
}
