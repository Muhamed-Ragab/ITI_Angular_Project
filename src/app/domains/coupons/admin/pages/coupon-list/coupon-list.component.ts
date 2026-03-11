import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AdminCouponFacadeService } from '../../services/admin-coupon-facade.service';

@Component({
  selector: 'app-admin-coupon-list',
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">{{ 'coupons.title' | translate }}</h2>
        <a routerLink="/admin/coupons/create" class="btn btn-primary">
          <i class="bi bi-plus-lg"></i> {{ 'coupons.createCoupon' | translate }}
        </a>
      </div>

      <!-- Error Alert -->
      @if (facade.error(); as error) {
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
          <button type="button" class="btn-close" (click)="clearError()"></button>
        </div>
      }

      <!-- Loading State -->
      @if (facade.isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ 'coupons.loading' | translate }}</span>
          </div>
          <p class="mt-2 text-muted">{{ 'coupons.loading' | translate }}</p>
        </div>
      }

      <!-- Coupons Table -->
      @if (!facade.isLoading() && !facade.error()) {
        <div class="card shadow-sm">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>{{ 'coupons.code' | translate }}</th>
                  <th>{{ 'coupons.discount' | translate }}</th>
                  <th>{{ 'coupons.minOrder' | translate }}</th>
                  <th>{{ 'coupons.usage' | translate }}</th>
                  <th>{{ 'coupons.status' | translate }}</th>
                  <th>{{ 'coupons.validPeriod' | translate }}</th>
                  <th>{{ 'coupons.actions' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (coupon of facade.coupons(); track coupon._id) {
                  <tr>
                    <td>
                      <strong>{{ coupon.code }}</strong>
                    </td>
                    <td>
                      @if (coupon.type === 'percentage') {
                        <span class="badge bg-info">{{ coupon.value }}%</span>
                      } @else {
                        <span class="badge bg-success">EGP {{ coupon.value }}</span>
                      }
                    </td>
                    <td>
                      @if (coupon.min_order_amount > 0) {
                        <small>EGP {{ coupon.min_order_amount }}</small>
                      } @else {
                        <small class="text-muted">{{ 'coupons.noMinimum' | translate }}</small>
                      }
                    </td>
                    <td>
                      {{ coupon.used_count }}
                      @if (coupon.usage_limit) {
                        <span class="text-muted"> / {{ coupon.usage_limit }}</span>
                      } @else {
                        <span class="text-muted"> / ∞</span>
                      }
                      <br />
                      <small class="text-muted"
                        >{{ 'coupons.perUser' | translate }} {{ coupon.per_user_limit }}</small
                      >
                    </td>
                    <td>
                      @if (coupon.is_active) {
                        <span class="badge bg-success">{{ 'coupons.active' | translate }}</span>
                      } @else {
                        <span class="badge bg-secondary">{{ 'coupons.inactive' | translate }}</span>
                      }
                    </td>
                    <td>
                      <small>
                        @if (coupon.starts_at) {
                          {{ coupon.starts_at | date: 'shortDate' }}
                        } @else {
                          <span class="text-muted">{{ 'coupons.anytime' | translate }}</span>
                        }
                        -
                        @if (coupon.ends_at) {
                          {{ coupon.ends_at | date: 'shortDate' }}
                        } @else {
                          <span class="text-muted">{{ 'coupons.noExpiry' | translate }}</span>
                        }
                      </small>
                    </td>
                    <td>
                      <div class="btn-group" role="group">
                        <a
                          [routerLink]="['/admin/coupons', coupon._id]"
                          class="btn btn-sm btn-outline-primary"
                          [title]="'coupons.viewDetails' | translate"
                        >
                          <i class="bi bi-eye"></i>
                        </a>
                        <a
                          [routerLink]="['/admin/coupons', coupon._id, 'edit']"
                          class="btn btn-sm btn-outline-secondary"
                          [title]="'coupons.edit' | translate"
                        >
                          <i class="bi bi-pencil"></i>
                        </a>
                        @if (coupon.is_active) {
                          <button
                            class="btn btn-sm btn-outline-warning"
                            [title]="'coupons.deactivate' | translate"
                            (click)="toggleCouponStatus(coupon._id, false)"
                            [disabled]="facade.isLoading()"
                          >
                            <i class="bi bi-pause-circle"></i>
                          </button>
                        } @else {
                          <button
                            class="btn btn-sm btn-outline-success"
                            [title]="'coupons.activate' | translate"
                            (click)="toggleCouponStatus(coupon._id, true)"
                            [disabled]="facade.isLoading()"
                          >
                            <i class="bi bi-play-circle"></i>
                          </button>
                        }
                        <button
                          class="btn btn-sm btn-outline-danger"
                          [title]="'coupons.delete' | translate"
                          (click)="deleteCoupon(coupon._id)"
                          [disabled]="facade.isLoading()"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                      <i class="bi bi-inbox d-block fs-1 mb-2"></i>
                      {{ 'coupons.noCoupons' | translate }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        @if (facade.pagination().pages > 1) {
          <nav aria-label="Coupons pagination" class="mt-4">
            <ul class="pagination justify-content-center">
              <li class="page-item" [class.disabled]="facade.pagination().page === 1">
                <button class="page-link" (click)="goToPage(facade.pagination().page - 1)">
                  {{ 'coupons.previous' | translate }}
                </button>
              </li>
              @for (page of getPageNumbers(); track page) {
                <li class="page-item" [class.active]="page === facade.pagination().page">
                  <button class="page-link" (click)="goToPage(page)">
                    {{ page }}
                  </button>
                </li>
              }
              <li
                class="page-item"
                [class.disabled]="facade.pagination().page === facade.pagination().pages"
              >
                <button class="page-link" (click)="goToPage(facade.pagination().page + 1)">
                  {{ 'coupons.next' | translate }}
                </button>
              </li>
            </ul>
          </nav>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCouponListComponent implements OnInit {
  readonly facade = inject(AdminCouponFacadeService);

  ngOnInit(): void {
    this.facade.loadCoupons();
  }

  clearError(): void {
    this.facade.loadCoupons();
  }

  goToPage(page: number): void {
    this.facade.goToPage(page);
  }

  getPageNumbers(): number[] {
    return this.facade.getPageNumbers();
  }

  toggleCouponStatus(id: string, activate: boolean): void {
    const action = activate ? 'activate' : 'deactivate';
    const message = `Are you sure you want to ${action} this coupon?`;

    if (confirm(message)) {
      const observable = activate
        ? this.facade.activateCoupon$(id)
        : this.facade.deactivateCoupon$(id);

      observable.subscribe({
        next: () => {
          // Reload coupons to reflect the change
          this.facade.loadCoupons();
        },
        error: (err) => {
          console.error(`Failed to ${action} coupon:`, err);
        },
      });
    }
  }

  deleteCoupon(id: string): void {
    if (confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      this.facade.deleteCoupon$(id).subscribe({
        next: () => {
          this.facade.loadCoupons();
        },
        error: (err) => {
          console.error('Failed to delete coupon:', err);
        },
      });
    }
  }
}
