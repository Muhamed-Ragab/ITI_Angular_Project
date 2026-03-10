import { Component, OnInit } from '@angular/core';
import { AdminPaymentService, Payment } from '../admin-payment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule], 
  template: `
    <div class="payment-container">
      <h2>Admin Payments</h2>

      @if (payments.length > 0) {
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            @for (pay of payments; track pay._id) {
              <tr>
                <td>{{ pay._id }}</td>
                <td>{{ pay.amount | currency }}</td>
                <td>
                  <span [class]="'badge-' + pay.status">
                    {{ pay.status | uppercase }}
                  </span>
                </td>
                <td>{{ pay.createdAt | date:'short' }}</td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <p>No payments found.</p>
      }
    </div>
  `,
  styles: [`
    .badge-succeeded { color: green; font-weight: bold; }
    .badge-pending { color: orange; }
    .badge-failed { color: red; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; border-bottom: 1px solid #ddd; text-align: left; }
  `]
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];

  constructor(private adminPaymentService: AdminPaymentService) {}

  ngOnInit() {
    this.adminPaymentService.getAdminPayments().subscribe({
      next: (data) => (this.payments = data.payments),
      error: (err) => console.error('API Error:', err)
    });
  }
}