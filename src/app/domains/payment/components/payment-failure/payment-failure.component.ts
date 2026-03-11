import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-failure',
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow text-center">
            <div class="card-body py-5">
              <div class="mb-4">
                <i class="bi bi-x-circle text-danger" style="font-size: 5rem;"></i>
              </div>
              <h2 class="card-title text-danger mb-3">{{ 'payment.failure.title' | translate }}</h2>
              <p class="card-text text-muted mb-4">
                {{ errorMessage() }}
              </p>

              @if (orderId()) {
                <p class="mb-4">
                  <strong>{{ 'payment.failure.orderId' | translate }}</strong> {{ orderId() }}
                </p>
              }

              <div class="d-grid gap-2">
                <button class="btn btn-primary" (click)="retryPayment()">
                  {{ 'payment.failure.tryAgain' | translate }}
                </button>
                <a routerLink="/checkout" class="btn btn-outline-secondary">{{
                  'payment.failure.backToCheckout' | translate
                }}</a>
                <a routerLink="/products" class="btn btn-outline-secondary">{{
                  'payment.failure.continueShopping' | translate
                }}</a>
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
