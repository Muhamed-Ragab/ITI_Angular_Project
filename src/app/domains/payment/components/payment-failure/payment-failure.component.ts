import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow-sm">
            <div class="card-body text-center py-5">
              <!-- Failure Icon -->
              <div class="mb-4">
                <div class="failure-icon mx-auto">
                  <i class="bi bi-x-lg"></i>
                </div>
              </div>

              <!-- Failure Message -->
              <h2 class="text-danger mb-3">Payment Failed</h2>
              <p class="text-muted mb-4">
                {{ errorMessage() || 'We were unable to process your payment. Please try again.' }}
              </p>

              <!-- Order ID -->
              @if (orderId) {
                <div class="bg-light rounded p-3 mb-4">
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">Order ID</span>
                    <span class="fw-bold">{{ orderId }}</span>
                  </div>
                </div>
              }

              <!-- Actions -->
              <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                <button class="btn btn-primary" (click)="retryPayment()" [disabled]="isRetrying()">
                  @if (isRetrying()) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Retrying...
                  } @else {
                    Try Again
                  }
                </button>
                <a routerLink="/cart" class="btn btn-outline-secondary"> Back to Cart </a>
              </div>
            </div>
          </div>

          <!-- Help Section -->
          <div class="card mt-4">
            <div class="card-body">
              <h5 class="card-title">Need Help?</h5>
              <p class="text-muted small mb-0">
                If you're still having trouble with your payment, please contact our support team.
              </p>
              <div class="mt-3">
                <a href="mailto:support@example.com" class="btn btn-sm btn-outline-primary">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .failure-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: #f8d7da;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .failure-icon i {
        font-size: 40px;
        color: #dc3545;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentFailureComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly orderId = this.route.snapshot.paramMap.get('orderId');
  readonly errorMessage = signal('');
  readonly isRetrying = signal(false);

  ngOnInit(): void {
    // Get error message from query params if available
    this.route.queryParams.subscribe((params) => {
      if (params['message']) {
        this.errorMessage.set(params['message']);
      }
    });
  }

  retryPayment(): void {
    this.isRetrying.set(true);

    // Redirect to checkout page to try again
    if (this.orderId) {
      this.router.navigate(['/checkout'], {
        queryParams: { orderId: this.orderId },
      });
    } else {
      this.router.navigate(['/cart']);
    }
  }
}
