import { CommonModule } from '@angular/common';
import { Component, computed, Input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SellerProfile } from '../../../SellerReview/dto/seller-request';

@Component({
  selector: 'app-customer-seller-status',
  imports: [CommonModule, TranslateModule],
  template: `
    @if (profile()) {
      <div class="card mt-3 shadow-sm">
        <div class="card-header bg-primary text-white">
          {{ 'profile.sellerStatusTitle' | translate }}
        </div>
        <div class="card-body">
          <p>
            <strong>{{ 'profile.storeNameLabel' | translate }}</strong> {{ profile()?.store_name }}
          </p>
          <p>
            <strong>{{ 'profile.bioLabel' | translate }}</strong> {{ profile()?.bio }}
          </p>
          <p>
            <strong>{{ 'profile.payoutMethodLabel' | translate }}</strong>
            {{ profile()?.payout_method }}
          </p>

          <p>
            <strong>{{ 'profile.statusLabel' | translate }}</strong>
            <span class="badge" [class]="statusClass()">
              {{ profile()?.approval_status | titlecase }}
            </span>
          </p>

          @if (profile()?.approval_note) {
            <p>
              <strong>{{ 'profile.adminNoteLabel' | translate }}</strong>
              {{ profile()?.approval_note }}
            </p>
          }
        </div>
      </div>
    } @else {
      <div class="alert alert-light mt-3 text-center">
        {{ 'profile.noSellerRequest' | translate }}
      </div>
    }
  `,
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
      'bg-warning': status === 'pending',
      'text-dark': status === 'pending',
      'bg-success': status === 'approved',
      'bg-danger': status === 'rejected',
    };
  });
}
