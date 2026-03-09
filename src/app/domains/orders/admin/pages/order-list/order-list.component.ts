import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderFilters, OrderStatus, PaymentStatus } from '../../dto';
import { AdminOrderFacadeService } from '../../services/admin-order-facade.service';

@Component({
  selector: 'app-admin-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Orders Management</h1>
      </div>

      <!-- Filters -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Status</label>
              <select class="form-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-outline-secondary" (click)="clearFilters()">Clear</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      @if (facade.error(); as error) {
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
          <button class="btn btn-sm btn-outline-danger ms-3" (click)="retry()">
            <i class="bi bi-arrow-clockwise"></i> Retry
          </button>
        </div>
      }

      <!-- Orders Table -->
      <div class="card shadow-sm">
        <div class="card-body p-0">
          @if (facade.isLoading()) {
            <div class="text-center py-5">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted">Loading orders...</p>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                   @for (order of facade.orders(); track order._id) {
                     <tr>
                       <td>
                         <a [routerLink]="['/admin/orders', order._id]" class="font-monospace">
                           {{ order._id | slice:0:8 }}...
                         </a>
                       </td>
                       <td>
                         @if (order.user) {
                           <div class="small text-muted">User ID: {{ order.user | slice:0:8 }}...</div>
                         } @else if (order.guest_info) {
                           <div>{{ order.guest_info.name }}</div>
                           <small class="text-muted">{{ order.guest_info.email }}</small>
                         } @else {
                           <span class="text-muted">N/A</span>
                         }
                       </td>
                       <td>{{ order.items.length }} items</td>
                       <td>EGP {{ order.total_amount | number:'1.0-0' }}</td>
                       <td>
                         <span class="badge" [class]="getStatusClass(order.status)">
                           {{ order.status }}
                         </span>
                       </td>
                       <td>
                         <span class="badge" [class]="getPaymentClass(order.payment_info.status)">
                           {{ order.payment_info.status }}
                         </span>
                       </td>
                       <td>{{ order.createdAt | date: 'short' }}</td>
                       <td>
                         <div class="dropdown">
                           <button
                             class="btn btn-sm btn-outline-secondary dropdown-toggle"
                             data-bs-toggle="dropdown"
                           >
                             Actions
                           </button>
                           <ul class="dropdown-menu">
                             <li>
                               <a class="dropdown-item" [routerLink]="['/admin/orders', order._id]">
                                 <i class="bi bi-eye me-2"></i>View Details
                               </a>
                             </li>
                             <li>
                               <a
                                 class="dropdown-item"
                                 [routerLink]="['/admin/orders', order._id, 'edit']"
                               >
                                 <i class="bi bi-pencil me-2"></i>Edit Order
                               </a>
                             </li>
                           </ul>
                         </div>
                       </td>
                     </tr>
                   } @empty {
                    <tr>
                      <td colspan="8" class="text-center py-4 text-muted">
                        <i class="bi bi-inbox d-block fs-1 mb-2"></i>
                        No orders found
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>

      <!-- Pagination -->
      @if (facade.pagination().pages > 1) {
        <nav class="mt-4" aria-label="Orders pagination">
          <ul class="pagination justify-content-center">
            <li class="page-item" [class.disabled]="facade.pagination().page === 1">
              <button class="page-link" (click)="goToPage(facade.pagination().page - 1)">
                Previous
              </button>
            </li>
            @for (page of facade.getPageNumbers(); track page) {
              <li class="page-item" [class.active]="page === facade.pagination().page">
                <button class="page-link" (click)="goToPage(page)">{{ page }}</button>
              </li>
            }
            <li
              class="page-item"
              [class.disabled]="facade.pagination().page === facade.pagination().pages"
            >
              <button class="page-link" (click)="goToPage(facade.pagination().page + 1)">
                Next
              </button>
            </li>
          </ul>
        </nav>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrderListComponent implements OnInit {
  readonly facade = inject(AdminOrderFacadeService);

  statusFilter = '';

  ngOnInit(): void {
    this.facade.loadOrders();
  }

  applyFilters(): void {
    const filters: OrderFilters = {};
    if (this.statusFilter) filters.status = this.statusFilter as OrderStatus;

    this.facade.setFilters(filters);
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.facade.clearFilters();
  }

  goToPage(page: number): void {
    this.facade.goToPage(page);
  }

  retry(): void {
    this.facade.loadOrders();
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

  getPaymentClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-warning text-dark',
      paid: 'bg-success',
      failed: 'bg-danger',
      refunded: 'bg-info',
      partially_refunded: 'bg-warning text-dark',
    };
    return classes[status] || 'bg-secondary';
  }
}
