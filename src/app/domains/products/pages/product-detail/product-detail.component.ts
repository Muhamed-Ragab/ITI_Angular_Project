import { CurrencyPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { GuestCartService } from '@core/services/guest-cart.service';
import { GuestWishlistService } from '@core/services/guest-wishlist.service';
import { ProductService } from '@core/services/product.service';
import { WishlistService } from '@core/services/wishlist.service';
import { ProductReviewsComponent } from '../../components/product-reviews/products-reviews.component';
import { ProductDetail, Review, ReviewsPagination } from '../../dto';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, CurrencyPipe, NgClass, ProductReviewsComponent, RouterLink],
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
                @for (star of [1, 2, 3, 4, 5]; track $index) {
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

            <!-- Category + Stock -->
            <div class="mb-3">
              @if (product()!.category_id.slug) {
                <small class="d-block text-muted mb-2"
                  >Category slug: {{ product()!.category_id.slug }}</small
                >
              }
            </div>

            <!-- Stock -->
            <span
              class="badge fs-6 mb-3"
              [ngClass]="stockQuantity() > 0 ? 'bg-success' : 'bg-danger'"
            >
              {{ stockQuantity() > 0 ? 'In Stock (' + stockQuantity() + ' left)' : 'Out of Stock' }}
            </span>

            <!-- Actions -->
            <div class="d-flex gap-2 mt-3">
              <button
                class="btn btn-primary px-4"
                (click)="addToCart()"
                [disabled]="stockQuantity() === 0"
              >
                <i class="bi bi-cart-plus me-2"></i>Add to Cart
              </button>
              @if (authService.isAuthenticated()) {
                <button
                  class="btn btn-success px-4"
                  (click)="buyNow()"
                  [disabled]="stockQuantity() === 0"
                >
                  <i class="bi bi-lightning-charge me-2"></i>Buy Now
                </button>
              } @else {
                <a
                  class="btn btn-success px-4"
                  [routerLink]="['/guest-checkout']"
                  [queryParams]="{ product_id: product()!._id }"
                >
                  <i class="bi bi-lightning-charge me-2"></i>Buy Now
                </a>
              }
              <button
                class="btn btn-sm"
                [class.btn-danger]="inWishlist()"
                [class.btn-outline-danger]="!inWishlist()"
                (click)="onToggleWishlist()"
                [title]="inWishlist() ? 'Remove from wishlist' : 'Add to wishlist'"
              >
                <i
                  class="bi"
                  [class.bi-heart-fill]="inWishlist()"
                  [class.bi-heart]="!inWishlist()"
                ></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <app-product-reviews
          [reviews]="visibleReviews()"
          [reviewsPagination]="reviewsPagination()"
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
  private readonly wishlistService = inject(WishlistService);
  private readonly guestWishlistService = inject(GuestWishlistService);
  private readonly cartService = inject(CartService);
  private readonly guestCartService = inject(GuestCartService);
  private readonly translate = inject(TranslateService);
  readonly authService = inject(AuthService);

  readonly product = signal<ProductDetail | null>(null);
  readonly selectedImage = signal<string>('');
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly inWishlist = signal(false);
  readonly reviewsPagination = signal<ReviewsPagination | null>(null);
  readonly visibleReviews = signal<Review[]>([]);

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.productService.getProductById(this.id()).subscribe({
      next: (res) => {
        const product = res.data;
        this.product.set(product);
        this.visibleReviews.set((product.reviews ?? []).filter((review) => !review.deletedAt));
        this.reviewsPagination.set(product.reviews_pagination ?? null);
        this.selectedImage.set(product.images[0] ?? '');

        if (this.authService.isAuthenticated()) {
          this.wishlistService.getWishlist().subscribe({
            next: (wishlistRes) => {
              const inWishlist = wishlistRes.data.some((item) => item.product_id === this.id());
              this.inWishlist.set(inWishlist);
            },
          });
        } else {
          this.inWishlist.set(this.guestWishlistService.isInWishlist(this.id()));
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || this.translate.instant('products.detail.notFound'));
        this.isLoading.set(false);
      },
    });
  }

  onReviewSubmit(review: { rating: number; comment: string }): void {
    this.productService
      .createReview({
        product_id: this.id(),
        ...review,
      })
      .subscribe({
        next: () => this.loadProduct(), // refresh to show new review
        error: (err) => this.error.set(err.message || this.translate.instant('products.detail.reviewSubmitError')),
      });
  }

  onToggleWishlist(): void {
    if (this.authService.isAuthenticated()) {
      if (this.inWishlist()) {
        this.wishlistService.removeFromWishlist(this.id()).subscribe({
          next: () => this.inWishlist.set(false),
        });
      } else {
        this.wishlistService.addToWishlist({ productId: this.id() }).subscribe({
          next: () => this.inWishlist.set(true),
        });
      }
    } else {
      if (this.inWishlist()) {
        this.guestWishlistService.removeFromWishlist(this.id());
        this.inWishlist.set(false);
      } else {
        this.guestWishlistService.addToWishlist(this.id());
        this.inWishlist.set(true);
      }
    }
  }

  addToCart(): void {
    const product = this.product();
    if (!product || this.stockQuantity() === 0) return;

    if (this.authService.isAuthenticated()) {
      this.cartService.addToCart(product._id, 1).subscribe();
    } else {
      this.guestCartService.addItem({
        productId: product._id,
        name: product.title,
        price: product.price,
        quantity: 1,
        image: product.images[0],
      });
    }
  }

  buyNow(): void {
    const product = this.product();
    if (!product || this.stockQuantity() === 0) return;

    // Add to cart and navigate to checkout
    this.cartService.addToCart(product._id, 1).subscribe({
      next: () => {
        this.router.navigate(['/checkout']);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  stockQuantity(): number {
    const product = this.product();
    if (!product) return 0;
    return product.stock_quantity ?? product.stock;
  }
}
