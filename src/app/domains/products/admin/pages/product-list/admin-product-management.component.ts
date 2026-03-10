import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminProduct, AdminProductFilters, AdminProductPagination } from '../../dto';
import { AdminProductService } from '../../services/admin-product.service';
import { AdminProductTableComponent } from '../../components/product-table/product-table.component';
import { AdminProductFormComponent } from '../product-form/admin-product-form.component';
import { Category } from '@domains/categories/dto';

@Component({
  selector: 'app-admin-product-management',
  standalone: true,
  imports: [FormsModule, TranslateModule, AdminProductTableComponent, AdminProductFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid py-4">

      <!-- Page header — no "Add Product" button (POST /products/admin not implemented in backend) -->
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 class="fw-bold mb-0">
            <i class="bi bi-box-seam me-2 text-primary"></i>{{ 'products.admin.management.title' | translate }}
          </h4>
          <p class="text-muted small mb-0 mt-1">
            {{ 'products.admin.management.description' | translate }}
          </p>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="fs-4 fw-bold text-primary">{{ pagination()?.total ?? '—' }}</div>
            <div class="small text-muted">{{ 'products.admin.management.totalProducts' | translate }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="fs-4 fw-bold text-success">{{ inStockCount() }}</div>
            <div class="small text-muted">{{ 'products.admin.management.inStock' | translate }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="fs-4 fw-bold text-danger">{{ outOfStockCount() }}</div>
            <div class="small text-muted">{{ 'products.admin.management.outOfStock' | translate }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="fs-4 fw-bold text-warning">{{ lowStockCount() }}</div>
            <div class="small text-muted">{{ 'products.admin.management.lowStock' | translate }}</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body py-3">
          <div class="row g-2 align-items-end">

            <div class="col-md-3">
              <label class="form-label small fw-semibold mb-1">{{ 'products.admin.management.search' | translate }}</label>
              <input
                class="form-control form-control-sm"
                [placeholder]="'products.admin.management.searchPlaceholder' | translate"
                [(ngModel)]="filters.search"
                name="search"
              />
            </div>

            <div class="col-md-2">
              <label class="form-label small fw-semibold mb-1">{{ 'products.admin.management.category' | translate }}</label>
              <select
                class="form-select form-select-sm"
                [(ngModel)]="filters.category_id"
                name="category"
              >
                <option value="">{{ 'products.admin.management.allCategories' | translate }}</option>
                @for (cat of flatCategories(); track cat._id) {
                  <option [value]="cat._id">
                    {{ cat.parentId ? '↳ ' : '' }}{{ cat.name }}
                  </option>
                }
              </select>
            </div>

            <div class="col-md-2">
              <label class="form-label small fw-semibold mb-1">{{ 'products.admin.management.sort' | translate }}</label>
              <select class="form-select form-select-sm" [(ngModel)]="filters.sort" name="sort">
                <option value="">{{ 'products.admin.management.default' | translate }}</option>
                <option value="newest">{{ 'products.filters.newest' | translate }}</option>
                <option value="price_asc">{{ 'products.filters.priceAsc' | translate }}</option>
                <option value="price_desc">{{ 'products.filters.priceDesc' | translate }}</option>
                <option value="rating">{{ 'products.filters.rating' | translate }}</option>
                <option value="popular">{{ 'products.filters.popular' | translate }}</option>
              </select>
            </div>

            <div class="col-md-1">
              <label class="form-label small fw-semibold mb-1">{{ 'products.admin.management.stock' | translate }}</label>
              <select class="form-select form-select-sm" [(ngModel)]="inStockFilter" name="inStock">
                <option value="">{{ 'products.admin.management.all' | translate }}</option>
                <option value="true">{{ 'products.admin.management.inStock' | translate }}</option>
                <option value="false">{{ 'products.admin.management.outOfStock' | translate }}</option>
              </select>
            </div>

            <div class="col-md-1">
              <label class="form-label small fw-semibold mb-1">{{ 'products.admin.management.perPage' | translate }}</label>
              <select class="form-select form-select-sm" [(ngModel)]="filters.limit" name="limit">
                <option [value]="10">10</option>
                <option [value]="25">25</option>
                <option [value]="50">50</option>
              </select>
            </div>

            <div class="col-md-3 d-flex gap-2">
              <button class="btn btn-primary btn-sm w-100" (click)="applyFilters()">
                <i class="bi bi-search me-1"></i>{{ 'products.admin.management.search' | translate }}
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
            {{ 'products.admin.management.deleteQuestion' | translate }} <strong>{{ productName(pendingDelete()!) }}</strong>? {{ 'products.admin.management.deleteWarning' | translate }}
          </span>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary" (click)="pendingDelete.set(null)">
              {{ 'products.admin.management.cancel' | translate }}
            </button>
            <button
              class="btn btn-sm btn-danger"
              [disabled]="isDeleting()"
              (click)="confirmDelete()"
            >
              @if (isDeleting()) { <span class="spinner-border spinner-border-sm me-1"></span> }
              <i class="bi bi-trash me-1"></i>{{ 'products.admin.management.deleteConfirm' | translate }}
            </button>
          </div>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="alert alert-danger mb-3">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ error() }}
          <button class="btn btn-sm btn-outline-danger ms-3" (click)="load()">{{ 'products.admin.management.retry' | translate }}</button>
        </div>
      }

      <!-- Table -->
      <div class="card border-0 shadow-sm">
        @if (isLoading()) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ 'products.list.loading' | translate }}</span>
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
  private readonly translate = inject(TranslateService);

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
        this.error.set(err?.error?.message ?? this.translate.instant('products.admin.management.errorLoading'));
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
    this.showSuccess(this.translate.instant('products.admin.management.success'));
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
        this.showSuccess(`"${this.productName(p)}" ${this.translate.instant('products.admin.management.deleteSuccess')}`);
        this.load();
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.pendingDelete.set(null);
        this.error.set(err?.error?.message ?? this.translate.instant('products.admin.management.errorDelete'));
      },
    });
  }

  productName(p: AdminProduct): string { return (p.title ?? p.name) as string; }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 3500);
  }
}