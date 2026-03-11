import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SellerRequestUser } from '../dto/seller-request';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-seller-requests',
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="container-fluid mt-4">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 class="fw-bold mb-0">
            <i class="bi bi-person-check me-2 text-primary"></i
            >{{ 'sellerReview.title' | translate }}
          </h4>
          <p class="text-muted small mb-0 mt-1">{{ 'sellerReview.description' | translate }}</p>
        </div>
        <button class="btn btn-outline-secondary btn-sm" (click)="loadRequests()">
          <i class="bi bi-arrow-clockwise me-1"></i>{{ 'sellerReview.refresh' | translate }}
        </button>
      </div>

      @if (successMsg()) {
        <div class="alert alert-success d-flex align-items-center gap-2 py-2 mb-3">
          <i class="bi bi-check-circle-fill"></i>{{ successMsg() }}
        </div>
      }

      @if (errorMsg()) {
        <div class="alert alert-danger py-2 mb-3">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ errorMsg() }}
        </div>
      }

      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary"></div>
          <p class="mt-2 text-muted">{{ 'sellerReview.loading' | translate }}</p>
        </div>
      } @else {
        <div class="card border-0 shadow-sm">
          <div
            class="card-header bg-dark text-white d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0">{{ 'sellerReview.applications' | translate }}</h5>
            <span class="badge bg-warning text-dark"
              >{{ requests().length }} {{ 'sellerReview.requests' | translate }}</span
            >
          </div>

          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th>{{ 'sellerReview.number' | translate }}</th>
                    <th>{{ 'sellerReview.applicant' | translate }}</th>
                    <th>{{ 'sellerReview.email' | translate }}</th>
                    <th>{{ 'sellerReview.storeName' | translate }}</th>
                    <th>{{ 'sellerReview.bio' | translate }}</th>
                    <th>{{ 'sellerReview.payoutMethod' | translate }}</th>
                    <th>{{ 'sellerReview.status' | translate }}</th>
                    <th style="width:200px">{{ 'sellerReview.adminNote' | translate }}</th>
                    <th style="width:180px">{{ 'sellerReview.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (req of requests(); track req._id; let i = $index) {
                    <tr>
                      <td class="text-muted">{{ i + 1 }}</td>
                      <td class="fw-semibold">{{ req.name }}</td>
                      <td class="text-muted small">{{ req.email }}</td>
                      <td>{{ req.seller_profile.store_name }}</td>
                      <td>
                        <span class="text-muted small">
                          {{
                            req.seller_profile.bio && req.seller_profile.bio.length > 60
                              ? req.seller_profile.bio.slice(0, 60) + '…'
                              : (req.seller_profile.bio ?? '—')
                          }}
                        </span>
                      </td>
                      <td>
                        <span class="badge bg-info">{{ req.seller_profile.payout_method }}</span>
                      </td>
                      <td>
                        @if (req.seller_profile.approval_status === 'pending') {
                          <span class="badge bg-warning text-dark">{{
                            'sellerReview.pending' | translate
                          }}</span>
                        } @else if (req.seller_profile.approval_status === 'approved') {
                          <span class="badge bg-success">{{
                            'sellerReview.approved' | translate
                          }}</span>
                        } @else {
                          <span class="badge bg-danger">{{
                            'sellerReview.rejected' | translate
                          }}</span>
                        }
                      </td>
                      <td>
                        <input
                          type="text"
                          class="form-control form-control-sm"
                          [placeholder]="'sellerReview.notePlaceholder' | translate"
                          [(ngModel)]="notes[req._id]"
                        />
                      </td>
                      <td>
                        <div class="d-flex gap-2">
                          <button
                            class="btn btn-sm btn-success"
                            [disabled]="
                              req.seller_profile.approval_status !== 'pending' ||
                              processingId() === req._id
                            "
                            (click)="approve(req._id)"
                          >
                            @if (processingId() === req._id) {
                              <span class="spinner-border spinner-border-sm"></span>
                            } @else {
                              {{ 'sellerReview.approve' | translate }}
                            }
                          </button>
                          <button
                            class="btn btn-sm btn-danger"
                            [disabled]="
                              req.seller_profile.approval_status !== 'pending' ||
                              processingId() === req._id
                            "
                            (click)="reject(req._id)"
                          >
                            {{ 'sellerReview.reject' | translate }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  }

                  @if (requests().length === 0) {
                    <tr>
                      <td colspan="9" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox" style="font-size:2rem"></i>
                        <p class="mt-2 mb-0">{{ 'sellerReview.noRequests' | translate }}</p>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminSellerRequestsComponent implements OnInit {
  private adminService = inject(AdminService);

  requests = signal<SellerRequestUser[]>([]);
  isLoading = signal(true);
  processingId = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);
  notes: Record<string, string> = {};

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading.set(true);
    this.errorMsg.set(null);
    this.adminService.getSellerRequests().subscribe({
      next: (res) => {
        this.requests.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message ?? 'Failed to load requests.');
        this.requests.set([]);
        this.isLoading.set(false);
      },
    });
  }

  approve(userId: string) {
    this.processingId.set(userId);
    this.errorMsg.set(null);
    const note = this.notes[userId] || undefined;

    this.adminService.reviewSellerRequest(userId, 'approved', note).subscribe({
      next: () => {
        this.processingId.set(null);
        this.showSuccess('Seller approved! They can now create products.');
        this.loadRequests();
      },
      error: (err) => {
        this.processingId.set(null);
        this.errorMsg.set(err?.error?.message ?? 'Failed to approve.');
      },
    });
  }

  reject(userId: string) {
    this.processingId.set(userId);
    this.errorMsg.set(null);
    const note = this.notes[userId] || undefined;

    this.adminService.reviewSellerRequest(userId, 'rejected', note).subscribe({
      next: () => {
        this.processingId.set(null);
        this.showSuccess('Request rejected.');
        this.loadRequests();
      },
      error: (err) => {
        this.processingId.set(null);
        this.errorMsg.set(err?.error?.message ?? 'Failed to reject.');
      },
    });
  }

  private showSuccess(msg: string) {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 4000);
  }
}
