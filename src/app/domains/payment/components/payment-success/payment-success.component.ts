import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-success',
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow text-center">
            <div class="card-body py-5">
              <div class="mb-4">
                <i class="bi bi-check-circle text-success" style="font-size: 5rem;"></i>
              </div>
              <h2 class="card-title text-success mb-3">
                {{ 'payment.success.title' | translate }}
              </h2>
              <p class="card-text text-muted mb-4">
                {{ 'payment.success.message' | translate }}
              </p>

              @if (orderId()) {
                <p class="mb-4">
                  <strong>{{ 'payment.success.orderId' | translate }}</strong> {{ orderId() }}
                </p>
              }

              <div class="d-grid gap-2">
                <a routerLink="/orders" class="btn btn-primary">{{
                  'payment.success.viewOrders' | translate
                }}</a>
                <a routerLink="/products" class="btn btn-outline-secondary">{{
                  'payment.success.continueShopping' | translate
                }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PaymentSuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly orderId = signal<string | null>(null);

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.orderId.set(params['orderId']);
    });
  }
}
