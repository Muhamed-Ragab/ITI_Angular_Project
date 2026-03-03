import { CurrencyPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '@core/services/product.service';
import { ProductReviewsComponent } from '../../components/product-reviews/products-reviews.component';
import { ProductDetail } from '../../dto';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, NgClass, ProductReviewsComponent],
  template: `
    <div class="container py-4">
      <!-- Back Button -->
      <button class="btn btn-outline-secondary btn-sm mb-4" (click)="goBack()">
        <i class="bi bi-arrow-left me-1"></i> Back to Products
      </button>

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

      <!-- Product Content -->
      @if (!isLoading() && product()) {
        <div class="row g-4">
          <!-- Left: Images -->
          <div class="col-md-5">
            <img
              [src]="selectedImage()"
              [alt]="product()!.title"
              class="img-fluid rounded shadow-sm w-100"
              style="height: 380px; object-fit: cover;"
            />
            <!-- Thumbnail Strip -->
            @if (product()!.images.length > 1) {
              <div class="d-flex gap-2 mt-2 flex-wrap">
                @for (img of product()!.images; track img) {
                  <img
                    [src]="img"
                    class="rounded border"
                    style="width: 60px; height: 60px; object-fit: cover; cursor: pointer;"
                    [class.border-primary]="selectedImage() === img"
                    (click)="selectedImage.set(img)"
                  />
                }
              </div>
            }
          </div>

          <!-- Right: Info -->
          <div class="col-md-7">
            <span class="badge bg-secondary mb-2">{{ product()!.category_id.name }}</span>
            <h3 class="fw-bold">{{ product()!.title }}</h3>

            <!-- Rating -->
            <div class="d-flex align-items-center gap-2 mb-3">
              <div>
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <i
                    class="bi small"
                    [class.bi-star-fill]="star <= product()!.average_rating"
                    [class.bi-star-half]="
                      star > product()!.average_rating && star - 0.5 <= product()!.average_rating
                    "
                    [class.bi-star]="star - 0.5 > product()!.average_rating"
                    class="text-warning"
                  >
                  </i>
                }
              </div>
              <span class="text-muted small">({{ product()!.ratings_count }} reviews)</span>
            </div>

            <p class="fs-3 fw-bold text-primary">{{ product()!.price | currency }}</p>

            <p class="text-muted">{{ product()!.description }}</p>

            <!-- Seller -->
            <div class="card border-0 bg-light p-3 mb-3">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-shop fs-4 text-primary"></i>
                <div>
                  <p class="mb-0 fw-semibold">{{ product()!.seller_id.name }}</p>
                  @if (product()!.seller_id.email) {
                    <small class="text-muted">{{ product()!.seller_id.email }}</small>
                  }
                </div>
              </div>
            </div>

            <!-- Stock -->
            <span
              class="badge fs-6 mb-3"
              [ngClass]="product()!.stock > 0 ? 'bg-success' : 'bg-danger'"
            >
              {{
                product()!.stock > 0 ? 'In Stock (' + product()!.stock + ' left)' : 'Out of Stock'
              }}
            </span>

            <!-- Actions -->
            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-primary px-4" [disabled]="product()!.stock === 0">
                <i class="bi bi-cart-plus me-2"></i>Add to Cart
              </button>
              <button class="btn btn-outline-danger">
                <i class="bi bi-heart"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <app-product-reviews
          [reviews]="product()!.reviews"
          (reviewSubmit)="onReviewSubmit($event)"
        />
      }
    </div>
  `,
})
export class ProductDetailComponent implements OnInit {
  // Gets :id from the URL automatically via withComponentInputBinding()
  readonly id = input.required<string>();

  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  readonly product = signal<ProductDetail | null>(null);
  readonly selectedImage = signal<string>('');
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.productService.getProductById(this.id()).subscribe({
      next: (res) => {
        this.product.set(res.data);
        this.selectedImage.set(res.data.images[0]); // default to first image
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Product not found');
        this.isLoading.set(false);
      },
    });
  }

  onReviewSubmit(review: { rating: number; comment: string }): void {
    this.productService
      .createReview({
        productId: this.id(),
        ...review,
      })
      .subscribe({
        next: () => this.loadProduct(), // refresh to show new review
        error: (err) => this.error.set(err.message || 'Failed to submit review'),
      });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
