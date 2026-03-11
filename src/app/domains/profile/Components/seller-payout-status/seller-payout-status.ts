import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileService } from '../../Services/profile.service';
import { PayoutResponse } from '../../dto/user-profile.dto';

@Component({
  selector: 'app-seller-payouts',
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>{{ 'profile.payoutRequestsTitle' | translate }}</h2>
        <button
          class="btn btn-outline-primary btn-sm"
          (click)="fetchPayouts()"
          [disabled]="loading()"
        >
          {{ 'profile.refresh' | translate }}
        </button>
      </div>

      @if (loading()) {
        <div class="d-flex justify-content-center my-4">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
      } @else if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      } @else if (payouts().length === 0) {
        <div class="alert alert-secondary text-center">{{ 'profile.noPayouts' | translate }}</div>
      } @else {
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead class="table-dark">
              <tr>
                <th>{{ 'profile.amount' | translate }}</th>
                <th>{{ 'profile.status' | translate }}</th>
                <th>{{ 'profile.note' | translate }}</th>
                <th>{{ 'profile.requestedAt' | translate }}</th>
                <th>{{ 'profile.reviewedAt' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (payout of payouts(); track payout._id) {
                <tr>
                  <td class="fw-bold">{{ payout.amount | currency: 'EGP ' : 'code' : '1.2-2' }}</td>
                  <td>
                    <span
                      class="badge rounded-pill"
                      [class.bg-warning]="payout.status === 'pending'"
                      [class.text-dark]="payout.status === 'pending'"
                      [class.bg-success]="payout.status === 'approved'"
                      [class.bg-danger]="payout.status === 'rejected'"
                    >
                      {{ payout.status | titlecase }}
                    </span>
                  </td>
                  <td class="text-muted small">{{ payout.note || '—' }}</td>
                  <td>{{ payout.requested_at | date: 'mediumDate' }}</td>
                  <td>
                    {{ payout.reviewed_at ? (payout.reviewed_at | date: 'mediumDate') : '—' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class SellerPayoutsComponent implements OnInit {
  payouts = signal<PayoutResponse[]>([]);
  loading = signal(true);
  error = signal('');

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.fetchPayouts();
  }

  fetchPayouts() {
    this.loading.set(true);
    this.error.set('');
    this.profileService.getSellerPayouts().subscribe({
      next: (data) => {
        this.payouts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load payout requests');
        this.loading.set(false);
      },
    });
  }
}
