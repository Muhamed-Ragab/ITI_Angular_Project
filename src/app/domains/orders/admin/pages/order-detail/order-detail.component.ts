import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrderStatus, UpdateOrderStatusRequest } from '../../dto';
import { AdminOrderFacadeService } from '../../services/admin-order-facade.service';

@Component({
  selector: 'app-admin-order-detail',
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <a routerLink="/admin/orders" class="btn btn-outline-secondary btn-sm mb-2">
            <i class="bi bi-arrow-left"></i> {{ 'adminOrders.detail.backToOrders' | translate }}
          </a>
          <h1 class="h3 mb-0">{{ 'adminOrders.detail.title' | translate }}</h1>
        </div>
      </div>

      @if (facade.isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">{{ 'adminOrders.detail.loading' | translate }}</span>
          </div>
        </div>
      } @else if (facade.error()) {
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ facade.error() }}
        </div>
      } @else if (facade.currentOrder(); as order) {
        <div class="row">
          <!-- Order Info -->
          <div class="col-lg-8">
            <div class="card shadow-sm mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0 font-monospace">
                  {{ 'adminOrders.orderNumber' | translate }}{{ order._id }}
                </h5>
                <div>
                  <span class="badge me-2" [class]="getStatusClass(order.status)">
                    {{ order.status }}
                  </span>
                  <span class="badge" [class]="getPaymentClass(order.payment_info.status)">
                    {{ order.payment_info.status }}
                  </span>
                </div>
              </div>
              <div class="card-body">
                <div class="row mb-4">
                  <div class="col-md-6">
                    <h6 class="text-muted mb-2">
                      {{ 'adminOrders.detail.customerInfo' | translate }}
                    </h6>
                    @if (order.guest_info) {
                      <p class="mb-1">
                        <strong>{{ order.guest_info.name }}</strong>
                        <span class="badge bg-secondary ms-1">{{
                          'adminOrders.detail.guest' | translate
                        }}</span>
                      </p>
                      <p class="mb-1">{{ order.guest_info.email }}</p>
                      <p class="mb-0">{{ order.guest_info.phone }}</p>
                    } @else if (order.user) {
                      <p class="mb-1">
                        <strong>{{ 'adminOrders.detail.registeredUser' | translate }}</strong>
                      </p>
                      <p class="mb-0 font-monospace text-muted small">{{ order.user }}</p>
                    }
                  </div>
                  <div class="col-md-6">
                    <h6 class="text-muted mb-2">
                      {{ 'adminOrders.detail.orderDates' | translate }}
                    </h6>
                    <p class="mb-1">
                      {{ 'adminOrders.detail.created' | translate }}
                      {{ order.createdAt | date: 'medium' }}
                    </p>
                    <p class="mb-0">
                      {{ 'adminOrders.detail.updated' | translate }}
                      {{ order.updatedAt | date: 'medium' }}
                    </p>
                  </div>
                </div>

                <!-- Order Items -->
                <h6 class="text-muted mb-3">{{ 'adminOrders.detail.orderItems' | translate }}</h6>
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>{{ 'adminOrders.detail.product' | translate }}</th>
                        <th class="text-center">{{ 'adminOrders.detail.qty' | translate }}</th>
                        <th class="text-end">{{ 'adminOrders.detail.unitPrice' | translate }}</th>
                        <th class="text-end">{{ 'adminOrders.detail.total' | translate }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of order.items; track item.product) {
                        <tr>
                          <td>{{ item.title }}</td>
                          <td class="text-center">{{ item.quantity }}</td>
                          <td class="text-end">EGP {{ item.price | number: '1.0-0' }}</td>
                          <td class="text-end">
                            EGP {{ item.price * item.quantity | number: '1.0-0' }}
                          </td>
                        </tr>
                      }
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="3" class="text-end">
                          {{ 'adminOrders.detail.subtotal' | translate }}
                        </td>
                        <td class="text-end">EGP {{ order.subtotal_amount | number: '1.0-0' }}</td>
                      </tr>
                      @if (order.discount_amount > 0) {
                        <tr>
                          <td colspan="3" class="text-end">
                            {{ 'adminOrders.detail.discount' | translate }}
                            @if (order.coupon_info) {
                              <span class="badge bg-success ms-2">{{
                                order.coupon_info.code
                              }}</span>
                            }
                          </td>
                          <td class="text-end text-success">
                            -EGP {{ order.discount_amount | number: '1.0-0' }}
                          </td>
                        </tr>
                      }
                      @if (order.shipping_amount > 0) {
                        <tr>
                          <td colspan="3" class="text-end">
                            {{ 'adminOrders.detail.shipping' | translate }}
                          </td>
                          <td class="text-end">
                            EGP {{ order.shipping_amount | number: '1.0-0' }}
                          </td>
                        </tr>
                      }
                      @if (order.tax_amount > 0) {
                        <tr>
                          <td colspan="3" class="text-end">
                            {{ 'adminOrders.detail.tax' | translate }}
                          </td>
                          <td class="text-end">EGP {{ order.tax_amount | number: '1.0-0' }}</td>
                        </tr>
                      }
                      <tr>
                        <td colspan="3" class="text-end">
                          <strong>{{ 'adminOrders.detail.total' | translate }}</strong>
                        </td>
                        <td class="text-end">
                          <strong>EGP {{ order.total_amount | number: '1.0-0' }}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <!-- Shipping Address -->
                <div class="mt-4">
                  <h6 class="text-muted mb-2">
                    {{ 'adminOrders.detail.shippingAddress' | translate }}
                  </h6>
                  <address class="mb-0">
                    {{ order.shipping_address.street }}<br />
                    {{ order.shipping_address.city }}, {{ order.shipping_address.zip }}<br />
                    {{ order.shipping_address.country }}
                  </address>
                </div>

                <!-- Payment Info -->
                <div class="mt-4">
                  <h6 class="text-muted mb-2">
                    {{ 'adminOrders.detail.paymentInfo' | translate }}
                  </h6>
                  <p class="mb-1">
                    {{ 'adminOrders.detail.method' | translate }}
                    <strong>{{
                      order.payment_info.method ?? ('adminOrders.detail.na' | translate)
                    }}</strong>
                  </p>
                  <p class="mb-1">
                    {{ 'adminOrders.detail.paymentStatus' | translate }}
                    <span class="badge" [class]="getPaymentClass(order.payment_info.status)">{{
                      order.payment_info.status
                    }}</span>
                  </p>
                  @if (order.payment_info.stripe_payment_intent_id) {
                    <p class="mb-0 font-monospace text-muted small">
                      {{ 'adminOrders.detail.pi' | translate }}
                      {{ order.payment_info.stripe_payment_intent_id }}
                    </p>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="col-lg-4">
            <!-- Update Status -->
            <div class="card shadow-sm mb-4">
              <div class="card-header">
                <h5 class="mb-0">{{ 'adminOrders.detail.updateStatus' | translate }}</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <label class="form-label">{{ 'adminOrders.detail.newStatus' | translate }}</label>
                  <select class="form-select" [(ngModel)]="newStatus">
                    <option value="pending">{{ 'adminOrders.pending' | translate }}</option>
                    <option value="shipped">{{ 'adminOrders.shipped' | translate }}</option>
                    <option value="delivered">{{ 'adminOrders.delivered' | translate }}</option>
                    <option value="cancelled">{{ 'adminOrders.cancelled' | translate }}</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">{{ 'adminOrders.detail.note' | translate }}</label>
                  <textarea
                    class="form-control"
                    rows="3"
                    [(ngModel)]="statusNote"
                    [placeholder]="'adminOrders.detail.notePlaceholder' | translate"
                  ></textarea>
                </div>
                <button
                  class="btn btn-primary w-100"
                  (click)="updateStatus()"
                  [disabled]="facade.isLoading()"
                >
                  {{ 'adminOrders.detail.updateBtn' | translate }}
                </button>
              </div>
            </div>

            <!-- Status Timeline -->
            <div class="card shadow-sm">
              <div class="card-header">
                <h5 class="mb-0">{{ 'adminOrders.detail.timeline' | translate }}</h5>
              </div>
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  @for (timeline of order.status_timeline; track timeline.changed_at) {
                    <div class="list-group-item">
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="badge" [class]="getStatusClass(timeline.status)">
                          {{ timeline.status }}
                        </span>
                        <small class="text-muted">{{ timeline.changed_at | date: 'short' }}</small>
                      </div>
                      @if (timeline.note) {
                        <p class="mb-0 mt-2 small">{{ timeline.note }}</p>
                      }
                      <small class="text-muted"
                        >{{ 'adminOrders.detail.source' | translate }} {{ timeline.source }}</small
                      >
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="alert alert-warning">{{ 'adminOrders.detail.notFound' | translate }}</div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrderDetailComponent implements OnInit {
  readonly facade = inject(AdminOrderFacadeService);
  private readonly route = inject(ActivatedRoute);

  orderId = '';
  newStatus: OrderStatus = 'pending';
  statusNote = '';
  notifyCustomer = true;

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    if (this.orderId) {
      this.facade.getOrderById$(this.orderId).subscribe();
    }
  }

  updateStatus(): void {
    const request: UpdateOrderStatusRequest = {
      status: this.newStatus,
      note: this.statusNote,
      notifyCustomer: this.notifyCustomer,
    };
    this.facade.updateOrderStatus$(this.orderId, request).subscribe((result) => {
      if (result) {
        this.statusNote = '';
      }
    });
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-warning text-dark',
      processing: 'bg-info',
      shipped: 'bg-primary',
      delivered: 'bg-success',
      paid: 'bg-success',
      cancelled: 'bg-danger',
      refunded: 'bg-secondary',
    };
    return classes[status] || 'bg-secondary';
  }

  getPaymentClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-warning text-dark',
      paid: 'bg-success',
      succeeded: 'bg-success',
      failed: 'bg-danger',
      requires_payment_method: 'bg-warning text-dark',
      refunded: 'bg-info',
      partially_refunded: 'bg-warning text-dark',
    };
    return classes[status] || 'bg-secondary';
  }
}
