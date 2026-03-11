import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AdminCouponFacadeService } from '../../services/admin-coupon-facade.service';

@Component({
  selector: 'app-admin-coupon-detail',
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">{{ 'coupons.detail.title' | translate }}</h2>
        <div>
          <a
            [routerLink]="['/admin/coupons', coupon()?._id, 'edit']"
            class="btn btn-outline-secondary me-2"
          >
            <i class="bi bi-pencil"></i> {{ 'coupons.edit' | translate }}
          </a>
          <a routerLink="/admin/coupons" class="btn btn-outline-primary">
            <i class="bi bi-arrow-left"></i> {{ 'coupons.form.backToList' | translate }}
          </a>
        </div>
      </div>

      <!-- Loading State -->
      @if (facade.isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ 'coupons.form.loading' | translate }}</span>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (facade.error(); as error) {
        <div class="alert alert-danger" role="alert">
          {{ error }}
        </div>
      }

      <!-- Coupon Details -->
      @if (!facade.isLoading() && !facade.error() && coupon()) {
        <div class="row">
          <div class="col-lg-8">
            <!-- Basic Info Card -->
            <div class="card shadow-sm mb-4">
              <div class="card-header bg-white">
                <h5 class="mb-0">{{ 'coupons.detail.basicInfo' | translate }}</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">{{
                      'coupons.detail.code' | translate
                    }}</label>
                    <p class="mb-0 fw-bold">{{ coupon()!.code }}</p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">{{
                      'coupons.detail.status' | translate
                    }}</label>
                    <p class="mb-0">
                      @if (coupon()!.is_active) {
                        <span class="badge bg-success">{{ 'coupons.active' | translate }}</span>
                      } @else {
                        <span class="badge bg-secondary">{{ 'coupons.inactive' | translate }}</span>
                      }
                    </p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">{{
                      'coupons.detail.discountType' | translate
                    }}</label>
                    <p class="mb-0">
                      @if (coupon()!.type === 'percentage') {
                        {{ 'coupons.detail.percentage' | translate }}
                      } @else {
                        {{ 'coupons.detail.fixed' | translate }}
                      }
                    </p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">{{
                      'coupons.detail.discountValue' | translate
                    }}</label>
                    <p class="mb-0">
                      @if (coupon()!.type === 'percentage') {
                        {{ coupon()!.value }}%
                      } @else {
                        {{ '$' + coupon()!.value }}
                      }
                    </p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">{{
                      'coupons.detail.minOrder' | translate
                    }}</label>
                    <p class="mb-0">
                      @if (coupon()!.min_order_amount) {
                        EGP {{ coupon()!.min_order_amount }}
                      } @else {
                        {{ 'coupons.detail.none' | translate }}
                      }
                    </p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">{{
                      'coupons.detail.usageLimit' | translate
                    }}</label>
                    <p class="mb-0">
                      @if (coupon()!.usage_limit) {
                        {{ coupon()!.usage_limit }}
                      } @else {
                        {{ 'coupons.detail.unlimited' | translate }}
                      }
                    </p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">{{
                      'coupons.detail.usedCount' | translate
                    }}</label>
                    <p class="mb-0">{{ coupon()!.used_count }}</p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">{{
                      'coupons.detail.perUserLimit' | translate
                    }}</label>
                    <p class="mb-0">{{ coupon()!.per_user_limit }}</p>
                  </div>
                  <div class="col-12 mb-3">
                    <label class="form-label text-muted">{{
                      'coupons.detail.description' | translate
                    }}</label>
                    <p class="mb-0">
                      @if (coupon()!.description) {
                        {{ coupon()!.description }}
                      } @else {
                        {{ 'coupons.detail.noDescription' | translate }}
                      }
                    </p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">{{
                      'coupons.detail.startDate' | translate
                    }}</label>
                    <p class="mb-0">
                      @if (coupon()!.starts_at) {
                        {{ coupon()!.starts_at | date: 'medium' }}
                      } @else {
                        <span class="text-muted">{{
                          'coupons.detail.noStartDate' | translate
                        }}</span>
                      }
                    </p>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">{{
                      'coupons.detail.endDate' | translate
                    }}</label>
                    <p class="mb-0">
                      @if (coupon()!.ends_at) {
                        {{ coupon()!.ends_at | date: 'medium' }}
                      } @else {
                        <span class="text-muted">{{ 'coupons.detail.noExpiry' | translate }}</span>
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <!-- Usage Stats Card -->
            <div class="card shadow-sm mb-4">
              <div class="card-header bg-white">
                <h5 class="mb-0">{{ 'coupons.detail.stats' | translate }}</h5>
              </div>
              <div class="card-body">
                @if (stats(); as couponStats) {
                  <div class="mb-3">
                    <label class="form-label text-muted">{{
                      'coupons.detail.totalUsed' | translate
                    }}</label>
                    <p class="mb-0 fs-4">{{ couponStats.totalUsed }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted">{{
                      'coupons.detail.totalDiscount' | translate
                    }}</label>
                    <p class="mb-0 fs-4">
                      {{ '$' + (couponStats.totalDiscountGiven | number: '1.2-2') }}
                    </p>
                  </div>

                  @if (couponStats.recentUsage.length) {
                    <div class="mt-4">
                      <h6>{{ 'coupons.detail.recentUsage' | translate }}</h6>
                      <ul class="list-group list-group-flush">
                        @for (usage of couponStats.recentUsage.slice(0, 5); track usage._id) {
                          <li class="list-group-item px-0 py-2">
                            <div class="d-flex justify-content-between">
                              <span>{{ usage.userName }}</span>
                              <span class="text-success">-{{ '$' + usage.discountAmount }}</span>
                            </div>
                            <small class="text-muted">{{ usage.usedAt | date: 'short' }}</small>
                          </li>
                        }
                      </ul>
                    </div>
                  }
                } @else {
                  <p class="text-muted mb-0">{{ 'coupons.detail.noUsage' | translate }}</p>
                }
              </div>
            </div>

            <!-- Actions Card -->
            <div class="card shadow-sm">
              <div class="card-header bg-white">
                <h5 class="mb-0">{{ 'coupons.detail.actions' | translate }}</h5>
              </div>
              <div class="card-body">
                @if (coupon()!.is_active) {
                  <button class="btn btn-outline-warning w-100 mb-2" (click)="deactivateCoupon()">
                    <i class="bi bi-pause-circle"></i> {{ 'coupons.detail.deactivate' | translate }}
                  </button>
                } @else {
                  <button class="btn btn-outline-success w-100 mb-2" (click)="activateCoupon()">
                    <i class="bi bi-play-circle"></i> {{ 'coupons.detail.activate' | translate }}
                  </button>
                }
                <button class="btn btn-outline-danger w-100" (click)="deleteCoupon()">
                  <i class="bi bi-trash"></i> {{ 'coupons.detail.deleteCoupon' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCouponDetailComponent implements OnInit {
  readonly facade = inject(AdminCouponFacadeService);
  private readonly route = inject(ActivatedRoute);

  readonly coupon = this.facade.currentCoupon;
  readonly stats = this.facade.couponStats;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.getCouponById$(id).subscribe();
      this.facade.getCouponStats$(id).subscribe();
    }
  }

  activateCoupon(): void {
    const id = this.coupon()?._id;
    if (id && confirm('Are you sure you want to activate this coupon?')) {
      this.facade.activateCoupon$(id).subscribe();
    }
  }

  deactivateCoupon(): void {
    const id = this.coupon()?._id;
    if (id && confirm('Are you sure you want to deactivate this coupon?')) {
      this.facade.deactivateCoupon$(id).subscribe();
    }
  }

  deleteCoupon(): void {
    const id = this.coupon()?._id;
    if (
      id &&
      confirm('Are you sure you want to delete this coupon? This action cannot be undone.')
    ) {
      this.facade.deleteCoupon$(id).subscribe((success) => {
        if (success) {
          window.location.href = '/admin/coupons';
        }
      });
    }
  }
}
