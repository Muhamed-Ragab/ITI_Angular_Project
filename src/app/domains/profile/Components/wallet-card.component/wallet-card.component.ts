import { Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-wallet-card',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="card bg-dark text-white shadow border-0 mb-4 p-4 text-center">
      <small class="text-white-50"> Wallet Balance </small>

      <h2 class="fw-bold">
        {{ balance | currency: 'USD' }}
      </h2>

      <p class="mb-0 text-warning small">Points: {{ points }}</p>
    </div>
  `,
})
export class WalletCardComponent {
  @Input() balance!: number;
  @Input() points!: number;
}
