import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminOrderFacadeService } from '../../services/admin-order-facade.service';
import { UpdateOrderStatusRequest, OrderStatus } from '../../dto';

@Component({
  selector: 'app-admin-order-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <a [routerLink]="['/admin/orders', orderId]" class="btn btn-outline-secondary btn-sm mb-2">
            <i class="bi bi-arrow-left"></i> Back to Order
          </a>
          <h1 class="h3 mb-0">Edit Order Status</h1>
        </div>
      </div>

      @if (facade.isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (facade.error()) {
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ facade.error() }}
        </div>
      } @else if (facade.currentOrder(); as order) {
        <div class="row justify-content-center">
          <div class="col-lg-6">
            <div class="card shadow-sm">
              <div class="card-header">
                <h5 class="mb-0">Update Order Status</h5>
                <small class="text-muted font-monospace">{{ order._id }}</small>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <label class="form-label">Current Status</label>
                  <div>
                    <span class="badge" [class]="getStatusClass(order.status)">{{ order.status }}</span>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">New Status</label>
                  <select class="form-select" [(ngModel)]="newStatus">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Note</label>
                  <textarea class="form-control" rows="3" [(ngModel)]="statusNote"
                            placeholder="Optional note about this status change..."></textarea>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-primary" (click)="updateStatus()"
                          [disabled]="facade.isLoading()">
                    <i class="bi bi-save me-1"></i> Save Changes
                  </button>
                  <a [routerLink]="['/admin/orders', orderId]" class="btn btn-outline-secondary">
                    Cancel
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="alert alert-warning">Order not found.</div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrderEditComponent implements OnInit {
  readonly facade = inject(AdminOrderFacadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  orderId = '';
  newStatus: OrderStatus = 'pending';
  statusNote = '';

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    if (this.orderId) {
      this.facade.getOrderById$(this.orderId).subscribe((order) => {
        if (order) {
          this.newStatus = order.status as OrderStatus;
        }
      });
    }
  }

  updateStatus(): void {
    const request: UpdateOrderStatusRequest = {
      status: this.newStatus,
      note: this.statusNote,
      notifyCustomer: true,
    };
    this.facade.updateOrderStatus$(this.orderId, request).subscribe((result) => {
      if (result) {
        this.router.navigate(['/admin/orders', this.orderId]);
      }
    });
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-warning text-dark',
      paid: 'bg-info',
      shipped: 'bg-primary',
      delivered: 'bg-success',
      cancelled: 'bg-danger',
    };
    return classes[status] || 'bg-secondary';
  }
}
