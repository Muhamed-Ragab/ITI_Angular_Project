import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SellerService } from '../../services/seller.services';
import { SellerProductFormComponent } from '../../components/seller-product-form/seller-product-form.component';
import { SellerProduct, SellerProductFilters, SellerPagination } from '../../dto/seller.dto';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [FormsModule, CommonModule, SellerProductFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4">

      <!-- Header -->
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 class="fw-bold mb-0">My Products</h4>
          <p class="text-muted small mb-0">Manage your product listings</p>
        </div>
        <button class="btn fw-semibold rounded-pill px-4"
          style="background:linear-gradient(135deg,#4ade80,#22c55e);color:#fff;border:none"
          (click)="openCreate()">
          <i class="bi bi-plus-lg me-1"></i>Add Product
        </button>
      </div>

      <!-- Filters -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body py-3">
          <div class="row g-2 align-items-end">
            <div class="col-md-5">
              <input class="form-control border-0 bg-light rounded-3"
                placeholder="Search products…"
                [(ngModel)]="filters.search" name="search" />
            </div>
            <div class="col-md-2">
              <select class="form-select border-0 bg-light rounded-3" [(ngModel)]="filters.limit">
                <option [value]="10">10 / page</option>
                <option [value]="25">25 / page</option>
                <option [value]="50">50 / page</option>
              </select>
            </div>
            <div class="col-md-3 d-flex gap-2">
              <button class="btn btn-primary rounded-3 w-100" (click)="applyFilters()">
                <i class="bi bi-search me-1"></i>Search
              </button>
              <button class="btn btn-outline-secondary rounded-3" (click)="resetFilters()">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Feedback -->
      @if (successMsg()) {
        <div class="alert alert-success border-0 rounded-3 py-2 mb-3">
          <i class="bi bi-check-circle-fill me-2"></i>{{ successMsg() }}
        </div>
      }
      @if (pendingDelete()) {
        <div class="alert alert-warning border-0 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <span><i class="bi bi-exclamation-triangle me-2"></i>Delete <strong>{{ pendingDelete()!.title }}</strong>?</span>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary rounded-pill" (click)="pendingDelete.set(null)">Cancel</button>
            <button class="btn btn-sm btn-danger rounded-pill" [disabled]="isDeleting()" (click)="confirmDelete()">
              @if (isDeleting()) { <span class="spinner-border spinner-border-sm me-1"></span> }
              Delete
            </button>
          </div>
        </div>
      }
      @if (error()) {
        <div class="alert alert-danger border-0 rounded-3 py-2 mb-3">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ error() }}
        </div>
      }

      <!-- Table -->
      <div class="card border-0 shadow-sm rounded-4">
        @if (isLoading()) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary"></div>
          </div>
        } @else if (products().length === 0) {
          <div class="text-center py-5 text-muted">
            <i class="bi bi-box-seam d-block mb-2" style="font-size:2.5rem"></i>
            <p class="mb-3">No products yet.</p>
            <button class="btn btn-primary rounded-pill px-4" (click)="openCreate()">Add your first product</button>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead style="background:#f8fafc">
                <tr class="text-muted small text-uppercase">
                  <th class="ps-4">Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th class="pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (p of products(); track p._id) {
                  <tr>
                    <td class="ps-4">
                      <div class="d-flex align-items-center gap-3">
                        <img
                          [src]="p.images?.[0] || 'https://placehold.co/48x48/e2e8f0/94a3b8?text=?'"
                          class="rounded-3" style="width:48px;height:48px;object-fit:cover"
                          (error)="onImgError($event)" />
                        <div>
                          <div class="fw-semibold">{{ p.title }}</div>
                          <div class="text-muted small">{{ p.description | slice:0:50 }}…</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge rounded-pill bg-light text-dark border">
                        {{ p.category_id?.name ?? '—' }}
                      </span>
                    </td>
                    <td class="fw-semibold">\${{ p.price | number:'1.2-2' }}</td>
                    <td>
                      @if (p.stock_quantity === 0) {
                        <span class="badge bg-danger rounded-pill">Out of stock</span>
                      } @else if (p.stock_quantity! <= 10) {
                        <span class="badge rounded-pill" style="background:#fef3c7;color:#92400e">
                          Low: {{ p.stock_quantity }}
                        </span>
                      } @else {
                        <span class="badge rounded-pill" style="background:#dcfce7;color:#166534">
                          {{ p.stock_quantity }}
                        </span>
                      }
                    </td>
                    <td>
                      @if (p.ratings_count && p.ratings_count > 0) {
                        <span class="text-warning me-1">★</span>
                        {{ p.average_rating | number:'1.1-1' }}
                        <span class="text-muted small">({{ p.ratings_count }})</span>
                      } @else {
                        <span class="text-muted small">No ratings</span>
                      }
                    </td>
                    <td class="pe-4">
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary rounded-3" (click)="openEdit(p)" title="Edit">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger rounded-3" (click)="requestDelete(p)" title="Delete">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (pagination() && pagination()!.pages > 1) {
            <div class="d-flex justify-content-between align-items-center px-4 py-3 border-top">
              <small class="text-muted">
                Showing {{ (filters.page! - 1) * filters.limit! + 1 }}–{{ min(filters.page! * filters.limit!, pagination()!.total) }}
                of {{ pagination()!.total }}
              </small>
              <div class="d-flex gap-1">
                <button class="btn btn-sm btn-outline-secondary rounded-3"
                  [disabled]="filters.page === 1" (click)="changePage(filters.page! - 1)">‹</button>
                <span class="btn btn-sm btn-primary rounded-3">{{ filters.page }}</span>
                <button class="btn btn-sm btn-outline-secondary rounded-3"
                  [disabled]="filters.page === pagination()!.pages"
                  (click)="changePage(filters.page! + 1)">›</button>
              </div>
            </div>
          }
        }
      </div>

    </div>

    @if (showForm()) {
      <app-seller-product-form
        [editTarget]="editTarget()"
        (saved)="onSaved()"
        (cancel)="showForm.set(false)"
      />
    }
  `,
})
export class SellerProductsComponent implements OnInit {
  private readonly sellerService = inject(SellerService);

  readonly products   = signal<SellerProduct[]>([]);
  readonly pagination = signal<SellerPagination | null>(null);
  readonly isLoading  = signal(false);
  readonly isDeleting = signal(false);
  readonly error      = signal<string | null>(null);
  readonly successMsg = signal<string | null>(null);
  readonly showForm   = signal(false);
  readonly editTarget = signal<SellerProduct | null>(null);
  readonly pendingDelete = signal<SellerProduct | null>(null);

  filters: SellerProductFilters = { page: 1, limit: 10 };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.sellerService.getMyProducts(this.filters).subscribe({
      next: (res) => {
        this.products.set(res.data.products);
        this.pagination.set(res.data.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load products.');
        this.isLoading.set(false);
      },
    });
  }

  applyFilters(): void { this.filters.page = 1; this.load(); }
  resetFilters(): void { this.filters = { page: 1, limit: 10 }; this.load(); }
  changePage(p: number): void { this.filters.page = p; this.load(); }

  openCreate(): void { this.editTarget.set(null); this.showForm.set(true); }
  openEdit(p: SellerProduct): void { this.editTarget.set(p); this.showForm.set(true); }

  onSaved(): void {
    this.showForm.set(false);
    this.flash(this.editTarget() ? 'Product updated!' : 'Product created!');
    this.load();
  }

  requestDelete(p: SellerProduct): void { this.pendingDelete.set(p); }

  confirmDelete(): void {
    const p = this.pendingDelete();
    if (!p) return;
    this.isDeleting.set(true);
    this.sellerService.deleteProduct((p._id ?? p.id) as string).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.pendingDelete.set(null);
        this.flash(`"${p.title}" deleted.`);
        this.load();
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.pendingDelete.set(null);
        this.error.set(err?.error?.message ?? 'Failed to delete.');
      },
    });
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/e2e8f0/94a3b8?text=?';
  }

  min(a: number, b: number): number { return Math.min(a, b); }

  private flash(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 3500);
  }
}
