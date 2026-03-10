import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminProduct, AdminProductFilters, AdminProductPagination } from '../../dto';
import { AdminProductService } from '../../services/admin-product.service';
import { AdminProductTableComponent } from '../../components/product-table/product-table.component';
import { AdminProductFormComponent } from '../product-form/admin-product-form.component';
import { Category } from '@domains/categories/dto';

@Component({
  selector: 'app-admin-product-management',
  standalone: true,
  imports: [FormsModule, AdminProductTableComponent, AdminProductFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid py-4">

      <!-- Page header — no "Add Product" button (POST /products/admin not implemented in backend) -->
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 class="fw-bold mb-0">
            <i class="bi bi-box-seam me-2 text-primary"></i>Product Management
          </h4>
          <p class="text-muted small mb-0 mt-1">
            Edit and moderate all products in the marketplace.
          </p>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="fs-4 fw-bold text-primary">{{ pagination()?.total ?? '—' }}</div>
            <div class="small text-muted">Total Products</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="fs-4 fw-bold text-success">{{ inStockCount() }}</div>
            <div class="small text-muted">In Stock</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="fs-4 fw-bold text-danger">{{ outOfStockCount() }}</div>
            <div class="small text-muted">Out of Stock</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="fs-4 fw-bold text-warning">{{ lowStockCount() }}</div>
            <div class="small text-muted">Low Stock (≤10)</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body py-3">
          <div class="row g-2 align-items-end">

            <div class="col-md-3">
              <label class="form-label small fw-semibold mb-1">Search</label>
              <input
                class="form-control form-control-sm"
                placeholder="Name or description…"
                [(ngModel)]="filters.search"
                name="search"
              />
            </div>

            <div class="col-md-2">
              <label class="form-label small fw-semibold mb-1">Category</label>
              <select
                class="form-select form-select-sm"
                [(ngModel)]="filters.category_id"
                name="category"
              >
                <option value="">All Categories</option>
                @for (cat of flatCategories(); track cat._id) {
                  <option [value]="cat._id">
                    {{ cat.parentId ? '↳ ' : '' }}{{ cat.name }}
                  </option>
                }
              </select>
            </div>

            <div class="col-md-2">
              <label class="form-label small fw-semibold mb-1">Sort</label>
              <select class="form-select form-select-sm" [(ngModel)]="filters.sort" name="sort">
                <option value="">Default</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
                <option value="rating">Rating</option>
                <option value="popular">Popular</option>
              </select>
            </div>

            <div class="col-md-1">
              <label class="form-label small fw-semibold mb-1">Stock</label>
              <select class="form-select form-select-sm" [(ngModel)]="inStockFilter" name="inStock">
                <option value="">All</option>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>

            <div class="col-md-1">
              <label class="form-label small fw-semibold mb-1">Per page</label>
              <select class="form-select form-select-sm" [(ngModel)]="filters.limit" name="limit">
                <option [value]="10">10</option>
                <option [value]="25">25</option>
                <option [value]="50">50</option>
              </select>
            </div>

            <div class="col-md-3 d-flex gap-2">
              <button class="btn btn-primary btn-sm w-100" (click)="applyFilters()">
                <i class="bi bi-search me-1"></i>Search
              </button>
              <button class="btn btn-outline-secondary btn-sm" (click)="resetFilters()" title="Reset">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- Success toast -->
      @if (successMsg()) {
        <div class="alert alert-success d-flex align-items-center gap-2 py-2 mb-3">
          <i class="bi bi-check-circle-fill"></i>{{ successMsg() }}
        </div>
      }

      <!-- Delete confirm banner -->
      @if (pendingDelete()) {
        <div class="alert alert-warning d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <span>
            <i class="bi bi-exclamation-triangle me-2"></i>
            Delete <strong>{{ productName(pendingDelete()!) }}</strong>? This cannot be undone.
          </span>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary" (click)="pendingDelete.set(null)">
              Cancel
            </button>
            <button
              class="btn btn-sm btn-danger"
              [disabled]="isDeleting()"
              (click)="confirmDelete()"
            >
              @if (isDeleting()) { <span class="spinner-border spinner-border-sm me-1"></span> }
              <i class="bi bi-trash me-1"></i>Delete
            </button>
          </div>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="alert alert-danger mb-3">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ error() }}
          <button class="btn btn-sm btn-outline-danger ms-3" (click)="load()">Retry</button>
        </div>
      }

      <!-- Table -->
      <div class="card border-0 shadow-sm">
        @if (isLoading()) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading…</span>
            </div>
          </div>
        } @else {
          <app-admin-product-table
            [products]="products()"
            [pagination]="pagination()"
            (edit)="openEdit($event)"
            (delete)="requestDelete($event)"
            (pageChange)="onPageChange($event)"
          />
        }
      </div>

    </div>

    <!-- Edit Modal -->
    @if (showForm()) {
      <app-admin-product-form
        [editTarget]="editTarget()"
        (saved)="onSaved()"
        (cancel)="showForm.set(false)"
      />
    }
  `,
})
export class AdminProductManagementComponent implements OnInit {
  private readonly adminProductService = inject(AdminProductService);

  readonly products     = signal<AdminProduct[]>([]);
  readonly pagination   = signal<AdminProductPagination | null>(null);
  readonly isLoading    = signal(false);
  readonly isDeleting   = signal(false);
  readonly error        = signal<string | null>(null);
  readonly successMsg   = signal<string | null>(null);
  readonly showForm     = signal(false);
  readonly editTarget   = signal<AdminProduct | null>(null);
  readonly pendingDelete = signal<AdminProduct | null>(null);
  readonly flatCategories = signal<Category[]>([]);

  filters: AdminProductFilters = { page: 1, limit: 10 };
  inStockFilter = '';

  inStockCount():    number { return this.products().filter(p => (p.stock_quantity ?? p.stock ?? 0) > 0).length; }
  outOfStockCount(): number { return this.products().filter(p => (p.stock_quantity ?? p.stock ?? 0) === 0).length; }
  lowStockCount():   number {
    return this.products().filter(p => {
      const s = p.stock_quantity ?? p.stock ?? 0;
      return s > 0 && s <= 10;
    }).length;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.load();
  }

  private loadCategories(): void {
    this.adminProductService.getCategories().subscribe({
      next: (res) => {
        const flat: Category[] = [];
        const flatten = (cats: Category[]) =>
          cats.forEach(c => { flat.push(c); if (c.subcategories?.length) flatten(c.subcategories); });
        flatten(res.data.categories);
        this.flatCategories.set(flat);
      },
      error: () => {},
    });
  }

  load(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const f: AdminProductFilters = { ...this.filters };
    // Fix: use in_stock (backend field name), not inStock
    if (this.inStockFilter === 'true')  f.in_stock = true;
    else if (this.inStockFilter === 'false') f.in_stock = false;

    this.adminProductService.getProducts(f).subscribe({
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

  resetFilters(): void {
    this.filters = { page: 1, limit: 10 };
    this.inStockFilter = '';
    this.load();
  }

  onPageChange(page: number): void { this.filters.page = page; this.load(); }

  openEdit(product: AdminProduct): void {
    this.editTarget.set(product);
    this.showForm.set(true);
  }

  onSaved(): void {
    this.showForm.set(false);
    this.showSuccess('Product updated successfully.');
    this.load();
  }

  requestDelete(product: AdminProduct): void { this.pendingDelete.set(product); }

  confirmDelete(): void {
    const p = this.pendingDelete();
    if (!p) return;
    this.isDeleting.set(true);
    const id = (p._id ?? p.id) as string;

    this.adminProductService.deleteProduct(id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.pendingDelete.set(null);
        this.showSuccess(`"${this.productName(p)}" deleted successfully.`);
        this.load();
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.pendingDelete.set(null);
        this.error.set(err?.error?.message ?? 'Failed to delete product.');
      },
    });
  }

  productName(p: AdminProduct): string { return (p.title ?? p.name) as string; }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 3500);
  }
}