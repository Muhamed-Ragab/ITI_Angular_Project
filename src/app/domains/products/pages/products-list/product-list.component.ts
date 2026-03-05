import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ProductService } from '../../../../core/services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductFiltersComponent } from '../../components/product-filters/product-filters.component';
import { ProductPaginationComponent } from '../../components/product-pagination/product-pagination.component';
import { Product, ProductFilters, ProductPagination } from '../../dto';

@Component({
  selector: 'app-product-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent, ProductFiltersComponent, ProductPaginationComponent],
  template: `
    <div class="container py-4">
      <h4 class="fw-bold mb-4"><i class="bi bi-grid me-2"></i>Products</h4>

      <app-product-filters (filtersChange)="onFiltersChange($event)" />

      <!-- Loading -->
      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ error() }}
        </div>
      }

      <!-- Empty -->
      @if (!isLoading() && !error() && products().length === 0) {
        <div class="text-center py-5 text-muted">
          <i class="bi bi-inbox" style="font-size: 3rem;"></i>
          <p class="mt-2">No products found. Try adjusting your filters.</p>
        </div>
      }

      <!-- Grid -->
      @if (!isLoading() && products().length > 0) {
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          @for (product of products(); track product._id) {
            <div class="col">
              <app-product-card [product]="product" />
            </div>
          }
        </div>
      }

      <app-product-pagination [pagination]="pagination()" (pageChange)="onPageChange($event)" />
    </div>
  `,
})
export class ProductListComponent {
  private readonly productService = inject(ProductService);

  readonly products = signal<Product[]>([]);
  readonly pagination = signal<ProductPagination | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  private filters: ProductFilters = { page: 1, limit: 10 };

  constructor() {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.productService.getProducts(this.filters).subscribe({
      next: (res) => {
        this.products.set(res.data.products);
        this.pagination.set(res.data.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load products');
        this.isLoading.set(false);
      },
    });
  }

  onFiltersChange(newFilters: ProductFilters): void {
    this.filters = { ...newFilters, page: 1 };
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.filters = { ...this.filters, page };
    this.loadProducts();
  }
}
