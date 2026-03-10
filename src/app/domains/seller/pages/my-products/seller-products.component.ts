import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe, SlicePipe } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { SellerService } from '../../services/seller.services';
import { SellerProductFormComponent } from '../../components/seller-product-form/seller-product-form.component';
import { SellerProduct, SellerProductFilters, SellerPagination } from '../../dto/seller.dto';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [FormsModule, CommonModule, DecimalPipe, SlicePipe, SellerProductFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-3 p-md-4">

      <!-- Header -->
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 class="fw-bold mb-0">My Products</h4>
          <p class="text-muted small mb-0">
            {{ pagination()?.total ?? 0 }} product(s) in your store
          </p>
        </div>
        <button class="btn fw-semibold rounded-pill px-4 shadow-sm"
          style="background:linear-gradient(135deg,#4ade80,#22c55e);color:#fff;border:none"
          (click)="openCreate()">
          <i class="bi bi-plus-lg me-2"></i>Add Product
        </button>
      </div>

      <!-- Filters -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body py-3 px-3">
          <div class="row g-2 align-items-end">
            <div class="col-md-6">
              <input class="form-control border-0 bg-light rounded-3"
                placeholder="🔍 Search products by name…"
                [(ngModel)]="searchText" name="search"
                (keyup.enter)="applySearch()" />
            </div>
            <div class="col-auto">
              <select class="form-select border-0 bg-light rounded-3" [(ngModel)]="filters.limit">
                <option [value]="10">10 / page</option>
                <option [value]="25">25 / page</option>
                <option [value]="50">50 / page</option>
              </select>
            </div>
            <div class="col-auto d-flex gap-2">
              <button class="btn btn-primary rounded-3 px-3" (click)="applySearch()">
                <i class="bi bi-search"></i>
              </button>
              <button class="btn btn-outline-secondary rounded-3" (click)="resetFilters()" title="Clear">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts -->
      @if (successMsg()) {
        <div class="alert alert-success border-0 rounded-3 py-2 mb-3 d-flex align-items-center gap-2">
          <i class="bi bi-check-circle-fill"></i>{{ successMsg() }}
        </div>
      }
      @if (error()) {
        <div class="alert alert-danger border-0 rounded-3 py-2 mb-3 d-flex align-items-center gap-2">
          <i class="bi bi-exclamation-triangle-fill"></i>{{ error() }}
        </div>
      }
      @if (pendingDelete()) {
        <div class="alert alert-warning border-0 rounded-3 d-flex align-items-center
          justify-content-between flex-wrap gap-2 mb-3">
          <span>
            <i class="bi bi-exclamation-triangle me-2"></i>
            Delete <strong>"{{ pendingDelete()!.title }}"</strong>? This cannot be undone.
          </span>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary rounded-pill"
              (click)="pendingDelete.set(null)">Cancel</button>
            <button class="btn btn-sm btn-danger rounded-pill"
              [disabled]="isDeleting()" (click)="confirmDelete()">
              @if (isDeleting()) { <span class="spinner-border spinner-border-sm me-1"></span> }
              Yes, Delete
            </button>
          </div>
        </div>
      }

      <!-- Table -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        @if (isLoading()) {
          <div class="text-center py-5">
            <div class="spinner-border" style="color:#4ade80"></div>
            <p class="text-muted mt-2 small">Loading products…</p>
          </div>
        } @else if (products().length === 0) {
          <div class="text-center py-5">
            <i class="bi bi-box-seam d-block mb-3 text-muted" style="font-size:3rem"></i>
            <p class="text-muted mb-3">No products yet. Start by adding your first one!</p>
            <button class="btn btn-primary rounded-pill px-4" (click)="openCreate()">
              <i class="bi bi-plus-lg me-1"></i>Add Product
            </button>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead style="background:#f8fafc">
                <tr class="text-muted" style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em">
                  <th class="ps-4 py-3">Product</th>
                  <th class="py-3">Category</th>
                  <th class="py-3">Price</th>
                  <th class="py-3">Stock</th>
                  <th class="py-3">Rating</th>
                  <th class="pe-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (p of products(); track p._id) {
                  <tr style="border-bottom:1px solid #f1f5f9">
                    <td class="ps-4 py-3">
                      <div class="d-flex align-items-center gap-3">
                        <img
                          [src]="p.images[0] || 'https://placehold.co/48x48/e2e8f0/94a3b8?text=?'"
                          class="rounded-3 border flex-shrink-0"
                          style="width:48px;height:48px;object-fit:cover"
                          (error)="onImgError($event)" />
                        <div>
                          <div class="fw-semibold" style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                            {{ p.title }}
                          </div>
                          <div class="text-muted small">
                            {{ p.description | slice:0:55 }}{{ p.description.length > 55 ? '…' : '' }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="py-3">
                      <span class="badge rounded-pill border fw-normal" style="background:#f0f9ff;color:#0369a1;border-color:#bae6fd!important">
                        {{ getCategoryName(p) }}
                      </span>
                    </td>
                    <td class="py-3 fw-semibold">\${{ p.price | number:'1.2-2' }}</td>
                    <td class="py-3">
                      @if ((p.stock_quantity || 0) === 0) {
                        <span class="badge rounded-pill bg-danger">Out of Stock</span>
                      } @else if ((p.stock_quantity || 0) <= 10) {
                        <span class="badge rounded-pill fw-normal"
                          style="background:#fef9c3;color:#854d0e">
                          ⚠ Low: {{ p.stock_quantity }}
                        </span>
                      } @else {
                        <span class="badge rounded-pill fw-normal"
                          style="background:#dcfce7;color:#166534">
                          {{ p.stock_quantity }}
                        </span>
                      }
                    </td>
                    <td class="py-3">
                      @if ((p.ratings_count ?? 0) > 0) {
                        <span class="text-warning me-1">★</span>
                        <span class="fw-semibold">{{ p.average_rating | number:'1.1-1' }}</span>
                        <span class="text-muted small ms-1">({{ p.ratings_count }})</span>
                      } @else {
                        <span class="text-muted small">No ratings</span>
                      }
                    </td>
                    <td class="pe-4 py-3 text-end">
                      <div class="d-flex gap-2 justify-content-end">
                        <button class="btn btn-sm btn-outline-primary rounded-3"
                          (click)="openEdit(p)" title="Edit">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger rounded-3"
                          (click)="requestDelete(p)" title="Delete">
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
            <div class="d-flex justify-content-between align-items-center px-4 py-3"
              style="border-top:1px solid #f1f5f9">
              <small class="text-muted">
                Showing {{ ((filters.page ?? 1) - 1) * (filters.limit ?? 10) + 1 }}–{{
                  minVal(((filters.page ?? 1)) * (filters.limit ?? 10), pagination()!.total)
                }} of {{ pagination()!.total }}
              </small>
              <div class="d-flex gap-1">
                <button class="btn btn-sm btn-outline-secondary rounded-3"
                  [disabled]="(filters.page ?? 1) <= 1"
                  (click)="changePage((filters.page ?? 1) - 1)">‹</button>
                @for (p of pageRange(); track p) {
                  <button class="btn btn-sm rounded-3"
                    [class.btn-primary]="p === filters.page"
                    [class.btn-outline-secondary]="p !== filters.page"
                    (click)="changePage(p)">{{ p }}</button>
                }
                <button class="btn btn-sm btn-outline-secondary rounded-3"
                  [disabled]="(filters.page ?? 1) >= pagination()!.pages"
                  (click)="changePage((filters.page ?? 1) + 1)">›</button>
              </div>
            </div>
          }
        }
      </div>

    </div>

    <!-- Product Form Modal -->
    @if (showForm()) {
      <app-seller-product-form
        [editTarget]="editTarget()"
        (saved)="onSaved()"
        (cancel)="showForm.set(false)" />
    }
  `,
})
export class SellerProductsComponent implements OnInit {
  private readonly sellerService = inject(SellerService);
  private readonly authService   = inject(AuthService);

  readonly products    = signal<SellerProduct[]>([]);
  readonly pagination  = signal<SellerPagination | null>(null);
  readonly isLoading   = signal(false);
  readonly isDeleting  = signal(false);
  readonly error       = signal<string | null>(null);
  readonly successMsg  = signal<string | null>(null);
  readonly showForm    = signal(false);
  readonly editTarget  = signal<SellerProduct | null>(null);
  readonly pendingDelete = signal<SellerProduct | null>(null);

  filters: SellerProductFilters = { page: 1, limit: 10 };
  searchText = '';

  ngOnInit(): void { this.load(); }

  private get sellerId(): string {
    const u: any = this.authService.currentUser();
    return u?._id ?? u?.id ?? '';
  }

  load(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.sellerService.getMyProducts(this.sellerId, this.filters).subscribe({
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

  applySearch(): void {
    this.filters.search = this.searchText || undefined;
    this.filters.page   = 1;
    this.load();
  }

  resetFilters(): void {
    this.searchText  = '';
    this.filters     = { page: 1, limit: 10 };
    this.load();
  }

  changePage(p: number): void { this.filters.page = p; this.load(); }

  pageRange(): number[] {
    const total = this.pagination()?.pages ?? 1;
    const cur   = this.filters.page ?? 1;
    const start = Math.max(1, cur - 2);
    const end   = Math.min(total, cur + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  openCreate(): void { this.editTarget.set(null); this.showForm.set(true); }
  openEdit(p: SellerProduct): void { this.editTarget.set(p); this.showForm.set(true); }

  onSaved(): void {
    this.showForm.set(false);
    this.flash(this.editTarget() ? 'Product updated successfully.' : 'Product created successfully.');
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
        this.error.set(err?.error?.message ?? 'Failed to delete product.');
      },
    });
  }

  getCategoryName(p: SellerProduct): string {
    const c = p.category_id as any;
    if (!c) return '—';
    return c?.name ?? '—';
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/e2e8f0/94a3b8?text=?';
  }

  minVal(a: number, b: number): number { return Math.min(a, b); }

  private flash(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 4000);
  }
}