import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js'
import { environment } from '@env/environment';

@Component({
  selector: 'app-stripe-payment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow">
            <div class="card-body">
              <h3 class="card-title mb-4">Complete Payment</h3>

              @if (isLoading()) {
                <div class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading payment form...</span>
                  </div>
                  <p class="mt-3 text-muted">Initializing secure payment...</p>
                </div>
              } @else if (error()) {
                <div class="alert alert-danger">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  {{ error() }}
                </div>
                <button class="btn btn-secondary" (click)="goBack()">Go Back</button>
              } @else {
                <!-- Stripe Payment Element will be mounted here -->
                <div id="payment-element" class="mb-4"></div>

                @if (paymentError()) {
                  <div class="alert alert-danger mb-3">
                    {{ paymentError() }}
                  </div>
                }

                <button
                  class="btn btn-primary w-100"
                  [disabled]="isProcessing()"
                  (click)="handleSubmit()"
                >
                  @if (isProcessing()) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  } @else {
                    Pay Now
                  }
                </button>

                <div class="text-center mt-3">
                  <small class="text-muted">
                    <i class="bi bi-lock me-1"></i>
                    Secured by Stripe
                  </small>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      #payment-element {
        min-height: 200px;
      }
    `,
  ],
})
export class StripePaymentComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly isProcessing = signal(false);
  readonly error = signal<string | null>(null);
  readonly paymentError = signal<string | null>(null);

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;
  private clientSecret: string | null = null;
  private orderId: string | null = null;

  async ngOnInit() {
    // Get clientSecret and orderId from query params
    this.route.queryParams.subscribe(async (params) => {
      this.clientSecret = params['clientSecret'];
      this.orderId = params['orderId'];

      if (!this.clientSecret || !this.orderId) {
        this.error.set('Missing payment information. Please try again.');
        this.isLoading.set(false);
        return;
      }

      await this.initializeStripe();
    });
  }

  private async initializeStripe() {
    try {
      const stripeKey = environment.stripePublishableKey;

      console.log('=== Stripe Initialization ===');
      console.log('Stripe Key:', stripeKey ? `${stripeKey.substring(0, 20)}...` : 'EMPTY');
      console.log('Environment:', environment);

      if (!stripeKey || stripeKey.trim() === '') {
        throw new Error('Stripe publishable key is not configured. Please set NG_APP_STRIPE_PUBLISHABLE_KEY in your .env file.');
      }

      // Load Stripe
      this.stripe = await loadStripe(stripeKey);

      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Create Elements instance
      this.elements = this.stripe.elements({
        clientSecret: this.clientSecret!,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0d6efd',
          },
        },
      });

      // Create Payment Element
      this.paymentElement = this.elements.create('payment');

      // Set loading to false first to render the DOM element
      this.isLoading.set(false);

      // Wait for next tick to ensure DOM is rendered, then mount
      setTimeout(() => {
        const element = document.getElementById('payment-element');
        if (element && this.paymentElement) {
          this.paymentElement.mount('#payment-element');
        } else {
          throw new Error('Payment element container not found');
        }
      }, 0);

    } catch (err: any) {
      console.error('Stripe initialization error:', err);
      this.error.set(err.message || 'Failed to initialize payment form');
      this.isLoading.set(false);
    }
  }

  async handleSubmit() {
    if (!this.stripe || !this.elements) {
      return;
    }

    this.isProcessing.set(true);
    this.paymentError.set(null);

    try {
      // Confirm the payment
      const { error: submitError } = await this.elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error: confirmError, paymentIntent } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success/${this.orderId}`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw confirmError;
      }

      // Payment succeeded
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Redirect to success page
        this.router.navigate(['/payment/success', this.orderId]);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      this.paymentError.set(err.message || 'Payment failed. Please try again.');
      this.isProcessing.set(false);
    }
  }

  goBack() {
    this.router.navigate(['/checkout']);
  }
}
