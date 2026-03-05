import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '@core/services/order.service';
import { formatCurrency, formatRelativeTime } from '@core/utils';
import { Order } from '@domains/orders/dto';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow-sm">
            <div class="card-body text-center py-5">
              <!-- Success Icon -->
              <div class="mb-4">
                <div class="success-icon mx-auto">
                  <i class="bi bi-check-lg"></i>
                </div>
              </div>

              <!-- Success Message -->
              <h2 class="text-success mb-3">Payment Successful!</h2>
              <p class="text-muted mb-4">
                Thank you for your purchase. Your order has been placed successfully.
              </p>

              <!-- Order Info -->
              @if (isLoading()) {
                <div class="spinner-border my-3"></div>
              } @else if (order()) {
                <div class="bg-light rounded p-3 mb-4">
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Order Number</span>
                    <span class="fw-bold">#{{ order()!.orderNumber }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Total Amount</span>
                    <span class="fw-bold">{{ formatCurrency(order()!.total) }}</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">Payment Method</span>
                    <span class="text-capitalize">{{ order()!.payment?.method || 'N/A' }}</span>
                  </div>
                </div>
              }

              <!-- Actions -->
              <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                <a [routerLink]="['/orders', orderId]" class="btn btn-primary">
                  View Order Details
                </a>
                <a routerLink="/products" class="btn btn-outline-secondary"> Continue Shopping </a>
              </div>
            </div>
          </div>

          <!-- Help Section -->
          <div class="text-center mt-4">
            <p class="text-muted small mb-2">Need help? Contact our support team</p>
            <a href="mailto:support@example.com" class="text-decoration-none">
              support&#64;example.com
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .success-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: #d1e7dd;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .success-icon i {
        font-size: 40px;
        color: #198754;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentSuccessComponent implements OnInit {
  protected readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  readonly orderId = this.route.snapshot.paramMap.get('orderId');
  readonly order = signal<Order | null>(null);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    if (this.orderId) {
      this.loadOrder();
    }
  }

  loadOrder(): void {
    if (!this.orderId) return;

    this.orderService.getOrderById(this.orderId).subscribe({
      next: (response) => {
        this.order.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  formatCurrency(amount: number): string {
    return formatCurrency(amount);
  }

  formatRelativeTime(
    dateString: string,
    prefix: 'created' | 'updated' | 'ordered' | 'paid' = 'created',
  ): string {
    return formatRelativeTime(dateString, { prefix });
  }
}
