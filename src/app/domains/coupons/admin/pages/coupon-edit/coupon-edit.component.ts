import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UpdateCouponRequest } from '../../dto';
import { AdminCouponFacadeService } from '../../services/admin-coupon-facade.service';

@Component({
  selector: 'app-admin-coupon-edit',
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">{{ 'coupons.form.editTitle' | translate }}</h2>
        <a [routerLink]="['/admin/coupons', couponId]" class="btn btn-outline-primary">
          <i class="bi bi-arrow-left"></i> {{ 'coupons.form.backToDetails' | translate }}
        </a>
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

      <!-- Form -->
      @if (!facade.isLoading() && !facade.error()) {
        <div class="card shadow-sm">
          <div class="card-body">
            <form (ngSubmit)="onSubmit()">
              <div class="row">
                <!-- Code -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">{{ 'coupons.form.code' | translate }} *</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="formData.code"
                    name="code"
                    required
                    uppercase
                  />
                </div>

                <!-- Discount Type -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">{{ 'coupons.form.discountType' | translate }} *</label>
                  <select class="form-select" [(ngModel)]="formData.type" name="type" required>
                    <option value="percentage">{{ 'coupons.form.percentage' | translate }}</option>
                    <option value="fixed">{{ 'coupons.form.fixed' | translate }}</option>
                  </select>
                </div>

                <!-- Discount Value -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">{{ 'coupons.form.discountValue' | translate }} *</label>
                  <input
                    type="number"
                    class="form-control"
                    [(ngModel)]="formData.value"
                    name="value"
                    required
                    min="0"
                    [step]="formData.type === 'percentage' ? '1' : '0.01'"
                  />
                </div>

                <!-- Min Order Amount -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">{{ 'coupons.form.minOrder' | translate }}</label>
                  <input
                    type="number"
                    class="form-control"
                    [(ngModel)]="formData.min_order_amount"
                    name="min_order_amount"
                    min="0"
                    step="0.01"
                  />
                </div>

                <!-- Min Purchase Amount -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">{{ 'coupons.form.minOrder' | translate }}</label>
                  <input
                    type="number"
                    class="form-control"
                    [(ngModel)]="formData.min_order_amount"
                    name="min_order_amount"
                    min="0"
                    step="0.01"
                  />
                </div>

                <!-- Usage Limit -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">{{ 'coupons.form.usageLimit' | translate }}</label>
                  <input
                    type="number"
                    class="form-control"
                    [(ngModel)]="formData.usage_limit"
                    name="usage_limit"
                    min="1"
                  />
                  <small class="text-muted">{{ 'coupons.form.unlimited' | translate }}</small>
                </div>

                <!-- Start Date -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">{{ 'coupons.form.startDate' | translate }} *</label>
                  <input
                    type="datetime-local"
                    class="form-control"
                    [(ngModel)]="formData.starts_at"
                    name="starts_at"
                    required
                  />
                </div>

                <!-- End Date -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">{{ 'coupons.form.endDate' | translate }} *</label>
                  <input
                    type="datetime-local"
                    class="form-control"
                    [(ngModel)]="formData.ends_at"
                    name="ends_at"
                    required
                  />
                </div>

                <!-- Description -->
                <div class="col-12 mb-3">
                  <label class="form-label">{{ 'coupons.form.description' | translate }}</label>
                  <textarea
                    class="form-control"
                    [(ngModel)]="formData.description"
                    name="description"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <!-- Submit Buttons -->
              <div class="d-flex justify-content-end gap-2 mt-4">
                <a [routerLink]="['/admin/coupons', couponId]" class="btn btn-outline-secondary">
                  {{ 'coupons.form.cancel' | translate }}
                </a>
                <button type="submit" class="btn btn-primary" [disabled]="facade.isLoading()">
                  @if (facade.isLoading()) {
                    <span class="spinner-border spinner-border-sm me-1"></span>
                  }
                  {{ 'coupons.form.save' | translate }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCouponEditComponent implements OnInit {
  readonly facade = inject(AdminCouponFacadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  couponId: string = '';
  formData = {
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    min_order_amount: undefined as number | undefined,
    usage_limit: undefined as number | undefined,
    per_user_limit: 1,
    starts_at: '' as string,
    ends_at: '' as string,
    is_active: 'true' as string, // HTML select returns string
  };

  ngOnInit(): void {
    this.couponId = this.route.snapshot.paramMap.get('id') || '';
    if (this.couponId) {
      this.facade.getCouponById$(this.couponId).subscribe((coupon) => {
        if (coupon) {
          this.formData = {
            code: coupon.code,
            description: coupon.description || '',
            type: coupon.type,
            value: coupon.value,
            min_order_amount: coupon.min_order_amount,
            usage_limit: coupon.usage_limit ?? undefined,
            per_user_limit: coupon.per_user_limit,
            starts_at: coupon.starts_at ? this.formatDateForInput(coupon.starts_at) : '',
            ends_at: coupon.ends_at ? this.formatDateForInput(coupon.ends_at) : '',
            is_active: coupon.is_active ? 'true' : 'false',
          };
        }
      });
    }
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  private convertToISOString(dateTimeLocal: string): string | null {
    if (!dateTimeLocal) return null;
    const date = new Date(dateTimeLocal);
    return date.toISOString();
  }

  onSubmit(): void {
    const request: UpdateCouponRequest = {
      code: this.formData.code,
      description: this.formData.description || undefined,
      type: this.formData.type,
      value: this.formData.value,
      min_order_amount: this.formData.min_order_amount || undefined,
      usage_limit: this.formData.usage_limit || null,
      per_user_limit: this.formData.per_user_limit,
      starts_at: this.convertToISOString(this.formData.starts_at),
      ends_at: this.convertToISOString(this.formData.ends_at),
      is_active: this.formData.is_active === 'true',
    };

    this.facade.updateCoupon$(this.couponId, request).subscribe((coupon) => {
      if (coupon) {
        this.router.navigate(['/admin/coupons', this.couponId]);
      }
    });
  }
}
