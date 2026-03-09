import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Adminpayoutservicereview } from '../adminpayoutservicereview';
import { PayoutResponse } from '@app/domains/profile/dto/user-profile.dto';

export interface AdminPayout extends PayoutResponse {
  _id: string; 
  userId: string;
  userName: string;
  wallet_balance: number;
}

@Component({
  selector: 'app-admin-payouts',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="container mt-4">

  <h3 class="mb-3">All Sellers Payout Requests</h3>

  <div *ngIf="loading()">
    <div class="alert alert-warning">Loading payouts...</div>
  </div>

  <div *ngIf="!loading()">
    <div *ngIf="payouts().length === 0" class="alert alert-secondary">
      No payout requests found
    </div>

    <table *ngIf="payouts().length > 0" class="table table-bordered table-striped">
      <thead class="table-dark">
        <tr>
          <th>Seller</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Wallet Balance</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let payout of payouts()">
          <td>{{payout.userName}}</td>
          <td>{{payout.amount}}</td>
          <td>
            <span *ngIf="payout.status === 'pending'" class="badge bg-warning text-dark">Pending</span>
            <span *ngIf="payout.status === 'approved'" class="badge bg-success">Approved</span>
            <span *ngIf="payout.status === 'rejected'" class="badge bg-danger">Rejected</span>
          </td>
          <td>{{payout.wallet_balance}}</td>
          <td>
            <button *ngIf="payout.status === 'pending'" class="btn btn-success btn-sm me-2" (click)="approve(payout)">Approve</button>
            <button *ngIf="payout.status === 'pending'" class="btn btn-danger btn-sm" (click)="reject(payout)">Reject</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

</div>
  `
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
        users.forEach(user => {
          user.seller_profile?.payout_requests?.forEach((p: PayoutResponse) => {
            allPayouts.push({
              ...p,
              _id: p._id, // تأكد أن هذا هو معرف الطلب وليس المستخدم
              userId: user._id,
              userName: user.name,
              wallet_balance: user.wallet_balance
            });
          });
        });
        this.payouts.set(allPayouts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  approve(payout: AdminPayout) {
    if (payout.amount > payout.wallet_balance) {
      alert("Seller's wallet balance is not enough");
      return;
    }

    this.adminService.reviewPayout(payout.userId, payout._id, { status: 'approved', note: 'Payment processed' })
      .subscribe(() => {
        // تحديث الـ Signal بطريقة صحيحة ليعمل الـ UI Re-render
        this.payouts.update(currentPayouts => 
          currentPayouts.map(p => 
            p._id === payout._id 
              ? { ...p, status: 'approved', wallet_balance: p.wallet_balance - p.amount } 
              : p
          )
        );
      });
  }

  reject(payout: AdminPayout) {
    this.adminService.reviewPayout(payout.userId, payout._id, { status: 'rejected', note: 'Rejected by admin' })
      .subscribe(() => {
        this.payouts.update(currentPayouts => 
          currentPayouts.map(p => 
            p._id === payout._id ? { ...p, status: 'rejected' } : p
          )
        );
      });
  }
}