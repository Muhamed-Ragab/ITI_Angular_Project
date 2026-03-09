import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SellerProfile } from '../../../SellerReview/dto/seller-request';

@Component({
  selector: 'app-customer-seller-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (profile()) {
      <div class="card mt-3 shadow-sm">
        <div class="card-header bg-primary text-white">
          Seller Request Status
        </div>
        <div class="card-body">
          <p><strong>Store Name:</strong> {{ profile()?.store_name }}</p>
          <p><strong>Bio:</strong> {{ profile()?.bio }}</p>
          <p><strong>Payout Method:</strong> {{ profile()?.payout_method }}</p>
          
          <p>
            <strong>Status:</strong>
            <span class="badge" [ngClass]="statusClass()">
              {{ profile()?.approval_status | titlecase }}
            </span>
          </p>

          @if (profile()?.approval_note) {
            <p><strong>Admin Note:</strong> {{ profile()?.approval_note }}</p>
          }
        </div>
      </div>
    } 
    @else {
      <div class="alert alert-light mt-3 text-center">
        You have not requested to become a seller yet.
      </div>
    }
  `
})
export class CustomerSellerStatusComponent {
  private _sellerProfile = signal<SellerProfile | null>(null);
  public profile = computed(() => this._sellerProfile());

  @Input()
  set sellerProfile(value: SellerProfile | null) {
    this._sellerProfile.set(value);
  }

  statusClass = computed(() => {
    const status = this.profile()?.approval_status;
    return {
      'bg-warning text-dark': status === 'pending',
      'bg-success': status === 'approved',
      'bg-danger': status === 'rejected'
    };
  });
}