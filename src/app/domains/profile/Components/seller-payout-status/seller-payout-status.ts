import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PayoutResponse } from '../../dto/user-profile.dto';

@Component({
  selector: 'app-seller-payout-status',
  standalone: true,
  imports: [CommonModule],
  template: `

  @for (payout of payouts; track payout.id) {

    <div class="card mt-3 border-0 shadow-sm">

      <div class="card-body d-flex justify-content-between">

        <div>
          <strong>$ {{payout.amount}}</strong>
          <div class="text-muted small">
            {{payout.requested_at | date:'medium'}}
          </div>
        </div>

        <span class="badge"
          [ngClass]="{
            'bg-warning': payout.status === 'pending',
            'bg-success': payout.status === 'approved',
            'bg-danger': payout.status === 'rejected'
          }">

          {{payout.status}}

        </span>

      </div>

    </div>

  }

  `
})
export class SellerPayoutStatus {

  @Input() payouts: PayoutResponse[] = [];

}