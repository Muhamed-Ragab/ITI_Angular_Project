import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { PayoutResponse } from '@app/domains/profile/dto/user-profile.dto';
import { TranslateModule } from '@ngx-translate/core';
import { Adminpayoutservicereview } from '../adminpayoutservicereview';

export interface AdminPayout extends PayoutResponse {
  _id: string;
  userId: string;
  userName: string;
  wallet_balance: number;
}

@Component({
  selector: 'app-admin-payouts',
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="container mt-4">
      <h3 class="mb-3">{{ 'adminPayouts.title' | translate }}</h3>

      @if (loading()) {
        <div>
          <div class="alert alert-warning">{{ 'adminPayouts.loading' | translate }}</div>
        </div>
      } @else {
        @if (payouts().length === 0) {
          <div class="alert alert-secondary">{{ 'adminPayouts.noPayouts' | translate }}</div>
        }

        @if (payouts().length > 0) {
          <table class="table table-bordered table-striped">
            <thead class="table-dark">
              <tr>
                <th>{{ 'adminPayouts.seller' | translate }}</th>
                <th>{{ 'adminPayouts.amount' | translate }}</th>
                <th>{{ 'adminPayouts.status' | translate }}</th>
                <th>{{ 'adminPayouts.walletBalance' | translate }}</th>
                <th>{{ 'adminPayouts.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (payout of payouts(); track payout._id) {
                <tr>
                  <td>{{ payout.userName }}</td>
                  <td>{{ payout.amount }}</td>
                  <td>
                    @switch (payout.status) {
                      @case ('pending') {
                        <span class="badge bg-warning text-dark">{{
                          'adminPayouts.pending' | translate
                        }}</span>
                      }
                      @case ('approved') {
                        <span class="badge bg-success">{{
                          'adminPayouts.approved' | translate
                        }}</span>
                      }
                      @case ('rejected') {
                        <span class="badge bg-danger">{{
                          'adminPayouts.rejected' | translate
                        }}</span>
                      }
                    }
                  </td>
                  <td>{{ payout.wallet_balance }}</td>
                  <td>
                    @if (payout.status === 'pending') {
                      <button class="btn btn-success btn-sm me-2" (click)="approve(payout)">
                        {{ 'adminPayouts.approve' | translate }}
                      </button>
                      <button class="btn btn-danger btn-sm" (click)="reject(payout)">
                        {{ 'adminPayouts.reject' | translate }}
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      }
    </div>
  `,
})
// ... imports
export class AdminPayoutsComponent implements OnInit {
  payouts = signal<AdminPayout[]>([]);
  loading = signal(true);
  private adminService = inject(Adminpayoutservicereview);

  ngOnInit() {
    this.loadPayouts();
  }

  loadPayouts() {
    this.loading.set(true);
    this.adminService.getAllSellers().subscribe({
      next: (users) => {
        const allPayouts: AdminPayout[] = [];
        users.forEach((user) => {
          user.seller_profile?.payout_requests?.forEach((p: PayoutResponse) => {
            allPayouts.push({
              ...p,
              _id: p._id, // تأكد أن هذا هو معرف الطلب وليس المستخدم
              userId: user._id,
              userName: user.name,
              wallet_balance: user.wallet_balance,
            });
          });
        });
        this.payouts.set(allPayouts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  approve(payout: AdminPayout) {
    if (payout.amount > payout.wallet_balance) {
      alert("Seller's wallet balance is not enough");
      return;
    }

    this.adminService
      .reviewPayout(payout.userId, payout._id, { status: 'approved', note: 'Payment processed' })
      .subscribe(() => {
        // تحديث الـ Signal بطريقة صحيحة ليعمل الـ UI Re-render
        this.payouts.update((currentPayouts) =>
          currentPayouts.map((p) =>
            p._id === payout._id
              ? { ...p, status: 'approved', wallet_balance: p.wallet_balance - p.amount }
              : p,
          ),
        );
      });
  }

  reject(payout: AdminPayout) {
    this.adminService
      .reviewPayout(payout.userId, payout._id, { status: 'rejected', note: 'Rejected by admin' })
      .subscribe(() => {
        this.payouts.update((currentPayouts) =>
          currentPayouts.map((p) => (p._id === payout._id ? { ...p, status: 'rejected' } : p)),
        );
      });
  }
}
