import { Component, output, signal } from '@angular/core';
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
              [ngModel]="filters().minPrice"
              (ngModelChange)="patch('minPrice', $event)"
              name="minPrice"
            />
          </div>

          <div class="col-md-2">
            <label class="form-label small fw-semibold">Max Price</label>
            <input
              type="number"
              class="form-control form-control-sm"
              [ngModel]="filters().maxPrice"
              (ngModelChange)="patch('maxPrice', $event)"
              name="maxPrice"
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

          <div class="col-md-2">
            <div class="form-check mt-4">
              <input
                class="form-check-input"
                type="checkbox"
                id="inStock"
                [checked]="filters().inStock === 'true'"
                (change)="patch('inStock', $any($event.target).checked ? 'true' : '')"
              />
              <label class="form-check-label small" for="inStock">In Stock Only</label>
            </div>
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
  readonly filtersChange = output<ProductFilters>(); // ← output() signal style

  readonly filters = signal<ProductFilters>({ page: 1, limit: 10 });

  patch(key: keyof ProductFilters, value: unknown): void {
    this.filters.update((f) => ({ ...f, [key]: value }));
  }

  apply(): void {
    this.filtersChange.emit({ ...this.filters(), page: 1 });
  }

  reset(): void {
    this.filters.set({ page: 1, limit: 10 });
    this.filtersChange.emit(this.filters());
  }
}
