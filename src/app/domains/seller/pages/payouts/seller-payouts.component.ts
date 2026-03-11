import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { ProfileService } from '@domains/profile/Services/profile.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SellerPayoutItem } from '../../dto/seller.dto';
import { SellerService } from '../../services/seller.services';

@Component({
  selector: 'app-seller-payouts',
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-3 p-md-4">
      <!-- Header -->
      <div class="mb-4">
        <h4 class="fw-bold mb-0">{{ 'seller.payouts.title' | translate }}</h4>
        <p class="text-muted small mb-0">{{ 'seller.payouts.subtitle' | translate }}</p>
      </div>

      <!-- Wallet card -->
      <div
        class="card border-0 rounded-4 mb-4 text-white overflow-hidden"
        style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);min-height:140px"
      >
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <p
                class="small mb-1 opacity-75 fw-semibold text-uppercase"
                style="letter-spacing:0.08em"
              >
                {{ 'seller.payouts.availableBalance' | translate }}
              </p>
              <h2 class="fw-bold mb-1">\${{ walletBalance() | number: '1.2-2' }}</h2>
              <p class="small mb-0 opacity-60">{{ userName() }}</p>
            </div>
            <div class="text-end">
              <i class="bi bi-wallet2" style="font-size:2.5rem;opacity:0.2"></i>
              <div class="mt-2">
                <span
                  class="badge rounded-pill px-3"
                  style="background:rgba(74,222,128,0.25);color:#4ade80"
                >
                  {{ 'seller.payouts.sellerAccount' | translate }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Request payout form -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-4">
          <h5 class="fw-bold mb-3">
            <i class="bi bi-send me-2" style="color:#4ade80"></i
            >{{ 'seller.payouts.requestTitle' | translate }}
          </h5>

          @if (formError()) {
            <div class="alert alert-danger border-0 rounded-3 py-2 mb-3 d-flex gap-2">
              <i class="bi bi-exclamation-triangle-fill"></i>{{ formError() }}
            </div>
          }
          @if (formSuccess()) {
            <div class="alert alert-success border-0 rounded-3 py-2 mb-3 d-flex gap-2">
              <i class="bi bi-check-circle-fill"></i>{{ formSuccess() }}
            </div>
          }

          <div class="row g-3 align-items-end">
            <div class="col-md-4">
              <label class="form-label fw-semibold small text-muted text-uppercase">{{
                'seller.payouts.amountLabel' | translate
              }}</label>
              <div class="input-group shadow-sm">
                <span class="input-group-text border-0 bg-light">$</span>
                <input
                  type="number"
                  class="form-control border-0 bg-light rounded-end-3"
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  [max]="walletBalance()"
                  [(ngModel)]="payoutAmount"
                  name="amount"
                />
              </div>
              @if (payoutAmount > walletBalance()) {
                <small class="text-danger d-block mt-1">
                  <i class="bi bi-exclamation-triangle me-1"></i
                  >{{ 'seller.payouts.exceedsBalance' | translate }}
                </small>
              }
            </div>

            <div class="col-md-5">
              <label class="form-label fw-semibold small text-muted text-uppercase">{{
                'seller.payouts.noteLabel' | translate
              }}</label>
              <input
                class="form-control border-0 bg-light shadow-sm rounded-3"
                [placeholder]="'seller.payouts.notePlaceholder' | translate"
                [(ngModel)]="payoutNote"
                name="note"
              />
            </div>

            <div class="col-md-3">
              <button
                class="btn w-100 fw-semibold rounded-3 text-white shadow-sm"
                style="background:linear-gradient(135deg,#4ade80,#22c55e);border:none"
                [disabled]="
                  isRequesting() ||
                  !payoutAmount ||
                  payoutAmount <= 0 ||
                  payoutAmount > walletBalance()
                "
                (click)="submitPayout()"
              >
                @if (isRequesting()) {
                  <span class="spinner-border spinner-border-sm me-1"></span
                  >{{ 'seller.payouts.processing' | translate }}
                } @else {
                  <i class="bi bi-send me-1"></i>{{ 'seller.payouts.requestBtn' | translate }}
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Payout history -->
      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-header bg-transparent border-0 pt-4 px-4">
          <h5 class="fw-bold mb-0">
            <i class="bi bi-clock-history me-2 text-muted"></i
            >{{ 'seller.payouts.history' | translate }}
          </h5>
        </div>
        <div class="card-body p-0">
          @if (isLoadingPayouts()) {
            <div class="text-center py-4">
              <div class="spinner-border spinner-border-sm text-muted"></div>
            </div>
          } @else if (payouts().length === 0) {
            <div class="text-center py-5 text-muted">
              <i class="bi bi-inbox d-block mb-2" style="font-size:2rem"></i>
              <p class="mb-0 small">{{ 'seller.payouts.noPayouts' | translate }}</p>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead style="background:#f8fafc">
                  <tr
                    class="text-muted"
                    style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em"
                  >
                    <th class="ps-4 py-3">{{ 'seller.payouts.amount' | translate }}</th>
                    <th class="py-3">{{ 'seller.payouts.status' | translate }}</th>
                    <th class="py-3">{{ 'seller.payouts.note' | translate }}</th>
                    <th class="py-3">{{ 'seller.payouts.requested' | translate }}</th>
                    <th class="pe-4 py-3">{{ 'seller.payouts.reviewed' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of payouts(); track p._id ?? $index) {
                    <tr style="border-bottom:1px solid #f1f5f9">
                      <td class="ps-4 py-3 fw-bold">\${{ p.amount | number: '1.2-2' }}</td>
                      <td class="py-3">
                        <span
                          class="badge rounded-pill px-3 fw-normal"
                          [class.bg-warning]="p.status === 'pending'"
                          [class.text-dark]="p.status === 'pending'"
                          [class.bg-success]="p.status === 'approved'"
                          [class.bg-danger]="p.status === 'rejected'"
                        >
                          {{ payoutStatusKey(p.status) | translate }}
                        </span>
                      </td>
                      <td class="py-3 text-muted small">{{ p.note || '—' }}</td>
                      <td class="py-3 small">{{ p.requested_at | date: 'MMM d, y' }}</td>
                      <td class="pe-4 py-3 small text-muted">
                        {{ p.reviewed_at ? (p.reviewed_at | date: 'MMM d, y') : '—' }}
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
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  private readonly translate = inject(TranslateService);

  readonly walletBalance = signal(0);
  readonly payouts = signal<SellerPayoutItem[]>([]);
  readonly isLoadingPayouts = signal(false);
  readonly isRequesting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly formSuccess = signal<string | null>(null);

  payoutAmount = 0;
  payoutNote = '';

  userName(): string {
    return this.authService.currentUser()?.name ?? '';
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.isLoadingPayouts.set(true);
    this.profileService.getUserProfile().subscribe({
      next: (profile) => {
        this.walletBalance.set(profile.wallet_balance ?? 0);
        const requests: SellerPayoutItem[] = (profile.seller_profile as any)?.payout_requests ?? [];
        this.payouts.set([...requests].reverse()); // newest first
        this.isLoadingPayouts.set(false);
      },
      error: () => this.isLoadingPayouts.set(false),
    });
  }

  payoutStatusKey(status: string): string {
    const map: Record<string, string> = {
      pending: 'seller.payouts.statusPending',
      approved: 'seller.payouts.statusApproved',
      rejected: 'seller.payouts.statusRejected',
    };
    return map[status] ?? status;
  }

  submitPayout(): void {
    if (!this.payoutAmount || this.payoutAmount <= 0) return;
    this.isRequesting.set(true);
    this.formError.set(null);
    this.formSuccess.set(null);

    this.sellerService.requestPayout(this.payoutAmount, this.payoutNote || undefined).subscribe({
      next: () => {
        this.isRequesting.set(false);
        this.formSuccess.set(
          this.translate.instant('seller.payouts.payoutSuccess', {
            amount: this.payoutAmount.toFixed(2),
          }),
        );
        this.payoutAmount = 0;
        this.payoutNote = '';
        setTimeout(() => this.formSuccess.set(null), 5000);
        this.loadProfile(); // refresh balance + history
      },
      error: (err) => {
        this.isRequesting.set(false);
        this.formError.set(err?.error?.message ?? 'Failed to request payout.');
      },
    });
  }
}
