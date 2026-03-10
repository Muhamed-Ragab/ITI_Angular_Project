import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { AdminPaymentService, Payment } from '../admin-payment';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-list-payment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body bg-dark text-white rounded">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-1">Payments Dashboard</h2>
              <p class="mb-0 opacity-75">Monitoring successful transactions</p>
            </div>
            <div class="text-end">
              <span class="badge bg-success fs-6">Status: Paid</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          @if (payments().length > 0) {
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                  <tr>
                    <th class="ps-4">Transaction ID</th>
                    <th>Customer ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  @for (pay of payments(); track pay._id) {
                    <tr>
                      <td class="ps-4">
                        <span class="text-muted small">#{{ pay._id }}</span>
                      </td>
                      <td>
                        <span class="badge bg-light text-dark border">{{ pay.user }}</span>
                      </td>
                      <td>
                        <span class="fw-bold text-primary">
                          {{ pay.total_amount | currency:'EGP ' }}
                        </span>
                      </td>
                      <td>
                        <div class="d-flex align-items-center">
                          <span class="dot bg-success me-2"></span>
                          <span class="text-success fw-medium">Succeeded</span>
                        </div>
                      </td>
                      <td>
                        <div class="small">
                          <div>{{ pay.createdAt | date:'mediumDate' }}</div>
                          <div class="text-muted small">{{ pay.createdAt | date:'shortTime' }}</div>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else if (isLoading()) {
            <div class="text-center py-5">
              <div class="spinner-border text-primary mb-3" role="status"></div>
              <p class="text-muted">Fetching payment records...</p>
            </div>
          } @else {
            <div class="text-center py-5">
              <p class="text-muted">No payments found.</p>
            </div>
          }
        </div>
        
        @if (pagination()) {
          <div class="card-footer bg-white py-3 border-top">
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-muted small">
                Showing <b>{{ payments().length }}</b> out of <b>{{ pagination()?.total }}</b> payments
              </span>
              <div class="small text-muted">
                Page {{ pagination()?.page }} of {{ pagination()?.pages }}
              </div>
            </div>
          </div>
        }
      </div>
    </div>

    <style>
      .dot {
        height: 8px;
        width: 8px;
        border-radius: 50%;
        display: inline-block;
      }
      .table thead th {
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
        padding: 1rem;
      }
      .table tbody td {
        padding: 1rem;
      }
    </style>
  `
})
export class PaymentsComponent implements OnInit {
  private adminPaymentService = inject(AdminPaymentService);
  
  payments = signal<Payment[]>([]);
  pagination = signal<any>(null);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading.set(true);
    
    this.adminPaymentService.getAdminPayments().subscribe({
      next: (data) => {
        this.payments.set(data.payments || []);
        this.pagination.set(data.pagination || null);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load payments:', err);
        this.isLoading.set(false);
      }
    });
  }
}