import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerService } from '../../services/seller.services';
import { AuthService } from '@core/services/auth.service';
import { SellerPayoutRequest } from '../../dto/seller.dto';

@Component({
  selector: 'app-seller-payouts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4">

      <div class="mb-4">
        <h4 class="fw-bold mb-0">Payouts</h4>
        <p class="text-muted small mb-0">Request withdrawals from your wallet balance</p>
      </div>

      <!-- Wallet Card -->
      <div class="card border-0 rounded-4 mb-4 text-white overflow-hidden"
        style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <p class="small mb-1 opacity-75">Available Balance</p>
              <h2 class="fw-bold mb-0">\${{ walletBalance() | number:'1.2-2' }}</h2>
              <p class="small mt-2 opacity-75">{{ currentUser()?.name }}</p>
            </div>
            <i class="bi bi-wallet2" style="font-size:2.5rem;opacity:0.3"></i>
          </div>
        </div>
      </div>

      <!-- Request Payout Form -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-4">
          <h5 class="fw-bold mb-3">Request Payout</h5>

          @if (requestError()) {
            <div class="alert alert-danger border-0 rounded-3 py-2 mb-3">
              <i class="bi bi-exclamation-triangle me-2"></i>{{ requestError() }}
            </div>
          }
          @if (requestSuccess()) {
            <div class="alert alert-success border-0 rounded-3 py-2 mb-3">
              <i class="bi bi-check-circle-fill me-2"></i>{{ requestSuccess() }}
            </div>
          }

          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label fw-semibold small text-muted text-uppercase">Amount ($)</label>
              <div class="input-group">
                <span class="input-group-text border-0 bg-light">$</span>
                <input type="number" class="form-control border-0 bg-light rounded-end-3"
                  placeholder="0.00" min="1" [max]="walletBalance()"
                  [(ngModel)]="payoutAmount" name="amount" />
              </div>
            </div>
            <div class="col-md-5">
              <label class="form-label fw-semibold small text-muted text-uppercase">Note (optional)</label>
              <input class="form-control border-0 bg-light rounded-3"
                placeholder="e.g. Monthly withdrawal"
                [(ngModel)]="payoutNote" name="note" />
            </div>
            <div class="col-md-3 d-flex align-items-end">
              <button class="btn w-100 fw-semibold rounded-3"
                style="background:linear-gradient(135deg,#4ade80,#22c55e);color:#fff;border:none"
                [disabled]="isRequesting() || !payoutAmount || payoutAmount <= 0 || payoutAmount > walletBalance()"
                (click)="submitPayout()">
                @if (isRequesting()) {
                  <span class="spinner-border spinner-border-sm me-1"></span>
                } @else {
                  <i class="bi bi-send me-1"></i>
                }
                Request Payout
              </button>
            </div>
          </div>
          @if (payoutAmount > walletBalance()) {
            <small class="text-danger mt-2 d-block">Amount exceeds your balance.</small>
          }
        </div>
      </div>

      <!-- Payout History -->
      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-header bg-transparent border-0 pt-4 px-4">
          <h5 class="fw-bold mb-0">Payout History</h5>
        </div>
        <div class="card-body p-0">
          @if (payouts().length === 0) {
            <div class="text-center py-5 text-muted">
              <i class="bi bi-clock-history d-block mb-2" style="font-size:2rem"></i>
              <p class="mb-0">No payout requests yet.</p>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead style="background:#f8fafc">
                  <tr class="text-muted small text-uppercase">
                    <th class="ps-4">Amount</th>
                    <th>Status</th>
                    <th>Note</th>
                    <th>Requested</th>
                    <th class="pe-4">Reviewed</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of payouts(); track p._id) {
                    <tr>
                      <td class="ps-4 fw-bold">\${{ p.amount | number:'1.2-2' }}</td>
                      <td>
                        <span class="badge rounded-pill px-3"
                          [class.bg-warning]="p.status === 'pending'"
                          [class.text-dark]="p.status === 'pending'"
                          [class.bg-success]="p.status === 'approved'"
                          [class.bg-danger]="p.status === 'rejected'">
                          {{ p.status | titlecase }}
                        </span>
                      </td>
                      <td class="text-muted small">{{ p.note || '—' }}</td>
                      <td class="small">{{ p.requested_at | date:'MMM d, y' }}</td>
                      <td class="pe-4 small">
                        {{ p.reviewed_at ? (p.reviewed_at | date:'MMM d, y') : '—' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>

    </div>
  `,
})
export class SellerPayoutsComponent implements OnInit {
  private readonly sellerService = inject(SellerService);
  private readonly authService   = inject(AuthService);

  readonly currentUser   = this.authService.currentUser;
  readonly walletBalance = signal(0);
  readonly payouts       = signal<SellerPayoutRequest[]>([]);
  readonly isRequesting  = signal(false);
  readonly requestError  = signal<string | null>(null);
  readonly requestSuccess = signal<string | null>(null);

  payoutAmount = 0;
  payoutNote   = '';

  ngOnInit(): void { this.loadProfile(); }

  private loadProfile(): void {
    // Wallet balance & payouts come from the user profile
    const user: any = this.authService.currentUser();
    if (user?.wallet_balance !== undefined) this.walletBalance.set(user.wallet_balance);
    const requests: SellerPayoutRequest[] = user?.seller_profile?.payout_requests ?? [];
    this.payouts.set([...requests].reverse());
  }

  submitPayout(): void {
    if (!this.payoutAmount || this.payoutAmount <= 0) return;
    this.isRequesting.set(true);
    this.requestError.set(null);
    this.requestSuccess.set(null);

    this.sellerService.requestPayout(this.payoutAmount, this.payoutNote || undefined).subscribe({
      next: () => {
        this.isRequesting.set(false);
        this.requestSuccess.set(`Payout request of $${this.payoutAmount} submitted successfully.`);
        this.payoutAmount = 0;
        this.payoutNote   = '';
        setTimeout(() => this.requestSuccess.set(null), 4000);
      },
      error: (err) => {
        this.isRequesting.set(false);
        this.requestError.set(err?.error?.message ?? 'Failed to request payout.');
      },
    });
  }
}
