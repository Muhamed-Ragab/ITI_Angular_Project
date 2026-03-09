import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminCouponFacadeService } from '../../services/admin-coupon-facade.service';
import { CreateCouponRequest } from '../../dto/create-coupon-request.dto';

@Component({
  selector: 'app-admin-coupon-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Create New Coupon</h2>
        <a routerLink="/admin/coupons" class="btn btn-outline-primary">
          <i class="bi bi-arrow-left"></i> Back to List
        </a>
      </div>

      <!-- Error State -->
      @if (facade.error(); as error) {
        <div class="alert alert-danger" role="alert">
          {{ error }}
        </div>
      }

      <!-- Form -->
      <div class="card shadow-sm">
        <div class="card-body">
          <form (ngSubmit)="onSubmit()">
            <div class="row">
              <!-- Code -->
              <div class="col-md-6 mb-3">
                <label class="form-label">Coupon Code *</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="formData.code"
                  name="code"
                  required
                  placeholder="e.g., SUMMER2024"
                />
              </div>

              <!-- Discount Type -->
              <div class="col-md-6 mb-3">
                <label class="form-label">Discount Type *</label>
                <select
                  class="form-select"
                  [(ngModel)]="formData.type"
                  name="type"
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <!-- Discount Value -->
              <div class="col-md-6 mb-3">
                <label class="form-label">Discount Value *</label>
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
                <label class="form-label">Min Order Amount</label>
                <input
                  type="number"
                  class="form-control"
                  [(ngModel)]="formData.min_order_amount"
                  name="min_order_amount"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <!-- Usage Limit -->
              <div class="col-md-6 mb-3">
                <label class="form-label">Usage Limit</label>
                <input
                  type="number"
                  class="form-control"
                  [(ngModel)]="formData.usage_limit"
                  name="usage_limit"
                  min="1"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <!-- Per User Limit -->
              <div class="col-md-6 mb-3">
                <label class="form-label">Per User Limit *</label>
                <input
                  type="number"
                  class="form-control"
                  [(ngModel)]="formData.per_user_limit"
                  name="per_user_limit"
                  required
                  min="1"
                  value="1"
                />
              </div>

              <!-- Active Status -->
              <div class="col-md-6 mb-3">
                <label class="form-label">Status</label>
                <select
                  class="form-select"
                  [(ngModel)]="formData.is_active"
                  name="is_active"
                >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
                </select>
              </div>

              <!-- Start Date -->
              <div class="col-md-6 mb-3">
                <label class="form-label">Start Date</label>
                <input
                  type="datetime-local"
                  class="form-control"
                  [(ngModel)]="formData.starts_at"
                  name="starts_at"
                />
                <small class="text-muted">Leave empty for immediate start</small>
              </div>

              <!-- End Date -->
              <div class="col-md-6 mb-3">
                <label class="form-label">End Date</label>
                <input
                  type="datetime-local"
                  class="form-control"
                  [(ngModel)]="formData.ends_at"
                  name="ends_at"
                />
                <small class="text-muted">Leave empty for no expiry</small>
              </div>

              <!-- Description -->
              <div class="col-12 mb-3">
                <label class="form-label">Description</label>
                <textarea
                  class="form-control"
                  [(ngModel)]="formData.description"
                  name="description"
                  rows="3"
                  placeholder="Enter coupon description..."
                ></textarea>
              </div>
            </div>

            <!-- Preview -->
            <div class="card bg-light mb-4">
              <div class="card-body">
                <h6 class="card-title">Coupon Preview</h6>
                <div class="d-flex align-items-center gap-3">
                  <span class="badge bg-primary fs-6">{{ formData.code || 'CODE' }}</span>
                  <span>
                    @if (formData.type === 'percentage') {
                      {{ formData.value }}% OFF
                    } @else {
                      EGP {{ formData.value }} OFF
                    }
                  </span>
                  @if (formData.min_order_amount) {
                    <small class="text-muted">Min: EGP {{ formData.min_order_amount }}</small>
                  }
                </div>
              </div>
            </div>

            <!-- Submit Buttons -->
            <div class="d-flex justify-content-end gap-2 mt-4">
              <a routerLink="/admin/coupons" class="btn btn-outline-secondary">
                Cancel
              </a>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="facade.isLoading() || !isFormValid()"
              >
                @if (facade.isLoading()) {
                  <span class="spinner-border spinner-border-sm me-1"></span>
                }
                Create Coupon
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCouponCreateComponent {
  readonly facade = inject(AdminCouponFacadeService);
  private readonly router = inject(Router);

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
    is_active: 'false' as string, // HTML select returns string
  };

  isFormValid(): boolean {
    return !!(
      this.formData.code &&
      this.formData.type &&
      this.formData.value > 0
    );
  }

  private convertToISOString(dateTimeLocal: string): string | null {
    if (!dateTimeLocal) return null;
    // datetime-local format: "2024-03-09T14:30"
    // Convert to ISO: "2024-03-09T14:30:00.000Z"
    const date = new Date(dateTimeLocal);
    return date.toISOString();
  }

  onSubmit(): void {
    const request: CreateCouponRequest = {
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

    this.facade.createCoupon$(request).subscribe((coupon) => {
      if (coupon) {
        this.router.navigate(['/admin/coupons', coupon._id]);
      }
    });
  }
}
