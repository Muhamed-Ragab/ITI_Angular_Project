import { Component, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductFilters } from '../../dto';

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <label class="form-label small fw-semibold">Search</label>
            <input
              class="form-control form-control-sm"
              placeholder="Search products..."
              [ngModel]="filters().search"
              (ngModelChange)="patch('search', $event)"
              name="search"
            />
          </div>

          <div class="col-md-2">
            <label class="form-label small fw-semibold">Min Price</label>
            <input
              type="number"
              class="form-control form-control-sm"
              [ngModel]="filters().min_price"
              (ngModelChange)="patch('min_price', $event)"
              name="min_price"
            />
          </div>

          <div class="col-md-2">
            <label class="form-label small fw-semibold">Max Price</label>
            <input
              type="number"
              class="form-control form-control-sm"
              [ngModel]="filters().max_price"
              (ngModelChange)="patch('max_price', $event)"
              name="max_price"
            />
          </div>

          <div class="col-md-2">
            <label class="form-label small fw-semibold">Sort</label>
            <select
              class="form-select form-select-sm"
              [ngModel]="filters().sort"
              (ngModelChange)="patch('sort', $event)"
              name="sort"
            >
              <option value="">Sort by...</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="rating">Rating</option>
              <option value="popular">Popular</option>
            </select>
          </div>

          <div class="col-md-1 d-flex gap-1 mt-3">
            <button class="btn btn-primary btn-sm" (click)="apply()">
              <i class="bi bi-search"></i>
            </button>
            <button class="btn btn-outline-secondary btn-sm" (click)="reset()">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProductFiltersComponent {
  readonly initialCategoryId = input<string | null>(null);
  readonly filtersChange = output<ProductFilters>();

  readonly filters = signal<ProductFilters>({ page: 1, limit: 10 });

  constructor() {
    // Update filters when category changes
    effect(() => {
      const categoryId = this.initialCategoryId();
      if (categoryId) {
        this.filters.update((f) => ({ ...f, category_id: categoryId }));
      }
    });
  }

  patch(key: keyof ProductFilters, value: unknown): void {
    this.filters.update((f) => ({ ...f, [key]: value }));
  }

  apply(): void {
    this.filtersChange.emit({ ...this.filters(), page: 1 });
  }

  reset(): void {
    const categoryId = this.initialCategoryId();
    const baseFilters: ProductFilters = { page: 1, limit: 10 };
    if (categoryId) {
      baseFilters.category_id = categoryId;
    }
    this.filters.set(baseFilters);
    this.filtersChange.emit(this.filters());
  }
}
