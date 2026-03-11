import { CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-wallet-card',
  imports: [CurrencyPipe, TranslateModule],
  template: `
    <div class="card bg-dark text-white shadow border-0 mb-4 p-4 text-center">
      <small class="text-white-50">{{ 'profile.walletBalance' | translate }}</small>

      <h2 class="fw-bold">
        {{ balance | currency: 'USD' }}
      </h2>

      <p class="mb-0 text-warning small">{{ 'profile.points' | translate }} {{ points }}</p>
    </div>
  `,
})
export class WalletCardComponent {
  @Input() balance!: number;
  @Input() points!: number;
}
