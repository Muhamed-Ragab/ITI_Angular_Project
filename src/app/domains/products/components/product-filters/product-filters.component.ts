import { Component, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductFilters } from '../../dto';

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  template: `
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <label class="form-label small fw-semibold">{{ 'products.filters.search' | translate }}</label>
            <input
              class="form-control form-control-sm"
              [placeholder]="'products.filters.searchPlaceholder' | translate"
              [ngModel]="filters().search"
              (ngModelChange)="patch('search', $event)"
              name="search"
            />
          </div>

          <div class="col-md-2">
            <label class="form-label small fw-semibold">{{ 'products.filters.minPrice' | translate }}</label>
            <input
              type="number"
              class="form-control form-control-sm"
              [ngModel]="filters().min_price"
              (ngModelChange)="patch('min_price', $event)"
              name="min_price"
            />
          </div>

          <div class="col-md-2">
            <label class="form-label small fw-semibold">{{ 'products.filters.maxPrice' | translate }}</label>
            <input
              type="number"
              class="form-control form-control-sm"
              [ngModel]="filters().max_price"
              (ngModelChange)="patch('max_price', $event)"
              name="max_price"
            />
          </div>

          <div class="col-md-2">
            <label class="form-label small fw-semibold">{{ 'products.filters.sort' | translate }}</label>
            <select
              class="form-select form-select-sm"
              [ngModel]="filters().sort"
              (ngModelChange)="patch('sort', $event)"
              name="sort"
            >
              <option value="">{{ 'products.filters.sortBy' | translate }}</option>
              <option value="newest">{{ 'products.filters.newest' | translate }}</option>
              <option value="price_asc">{{ 'products.filters.priceAsc' | translate }}</option>
              <option value="price_desc">{{ 'products.filters.priceDesc' | translate }}</option>
              <option value="rating">{{ 'products.filters.rating' | translate }}</option>
              <option value="popular">{{ 'products.filters.popular' | translate }}</option>
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
