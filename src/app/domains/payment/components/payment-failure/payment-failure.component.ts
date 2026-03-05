import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow text-center">
            <div class="card-body py-5">
              <div class="mb-4">
                <i class="bi bi-x-circle text-danger" style="font-size: 5rem;"></i>
              </div>
              <h2 class="card-title text-danger mb-3">Payment Failed</h2>
              <p class="card-text text-muted mb-4">
                {{ errorMessage() || 'We were unable to process your payment. Please try again.' }}
              </p>

              @if (orderId()) {
                <p class="mb-4">
                  <strong>Order ID:</strong> {{ orderId() }}
                </p>
              }

              <div class="d-grid gap-2">
                <button class="btn btn-primary" (click)="retryPayment()">Try Again</button>
                <a routerLink="/checkout" class="btn btn-outline-secondary">Back to Checkout</a>
                <a routerLink="/products" class="btn btn-outline-secondary">Continue Shopping</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PaymentFailureComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly orderId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.orderId.set(params['orderId']);
    });

    this.route.queryParams.subscribe((params) => {
      this.errorMessage.set(params['message']);
    });
  }

  retryPayment() {
    if (this.orderId()) {
      // Redirect back to checkout or payment page
      this.router.navigate(['/checkout']);
    }
  }
}
