import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';           // ← Fix 2
import { WishlistService } from '@core/services/wishlist.service';
import { WishlistCardComponent } from '../../components/wishlist-card/wishlist-card.component';
import { WishlistItem } from '../../dto';

@Component({
  selector: 'app-wishlist-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WishlistCardComponent, RouterLink],          // ← Fix 2
  template: `
    <div class="container py-4">

      <div class="d-flex align-items-center justify-content-between mb-4">
        <h4 class="fw-bold mb-0">
          <i class="bi bi-heart-fill text-danger me-2"></i>
          My Wishlist
          @if (!isLoading() && wishlist().length > 0) {
            <span class="badge bg-secondary ms-2">{{ wishlist().length }}</span>
          }
        </h4>

        @if (wishlist().length > 0) {
          <button
            class="btn btn-outline-danger btn-sm"
            (click)="clearAll()"
            [disabled]="isLoading()"
          >
            <i class="bi bi-trash me-1"></i>Clear All
          </button>
        }
      </div>

      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }

      @if (error()) {
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ error() }}
        </div>
      }

      @if (successMsg()) {
        <div class="alert alert-success alert-dismissible">
          <i class="bi bi-check-circle me-2"></i>{{ successMsg() }}
          <button type="button" class="btn-close" (click)="successMsg.set(null)"></button>
        </div>
      }

      @if (!isLoading() && !error() && wishlist().length === 0) {
        <div class="text-center py-5">
          <i class="bi bi-heart text-muted" style="font-size: 4rem;"></i>
          <h5 class="mt-3 text-muted">Your wishlist is empty</h5>
          <p class="text-muted">Start saving products you love!</p>
          <a routerLink="/products" class="btn btn-primary mt-2">
            <i class="bi bi-grid me-2"></i>Browse Products
          </a>
        </div>
      }

      @if (!isLoading() && wishlist().length > 0) {
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          @for (item of wishlist(); track item.productId) {
            <div class="col">
              <app-wishlist-card
                [item]="item"
                (remove)="onRemove($event)"
              />
            </div>
          }
        </div>
      }

    </div>
  `,
})
export class WishlistListComponent implements OnInit {
  private readonly wishlistService = inject(WishlistService);

  readonly wishlist = signal<WishlistItem[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMsg = signal<string | null>(null);

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        this.wishlist.set(res.data.wishlist);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load wishlist');
        this.isLoading.set(false);
      },
    });
  }

  onRemove(productId: string): void {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.wishlist.update(list => list.filter(i => i.productId !== productId));
        this.successMsg.set('Item removed from wishlist');
        setTimeout(() => this.successMsg.set(null), 3000);
      },
      error: (err) => this.error.set(err.message || 'Failed to remove item'),
    });
  }

  // ← Fix 1: each delete updates UI immediately as it succeeds
  clearAll(): void {
    const ids = this.wishlist().map(i => i.productId);

    ids.forEach(id => {
      this.wishlistService.removeFromWishlist(id).subscribe({
        next: () => {
          this.wishlist.update(list => list.filter(i => i.productId !== id));

          if (this.wishlist().length === 0) {
            this.successMsg.set('Wishlist cleared');
            setTimeout(() => this.successMsg.set(null), 3000);
          }
        },
        error: () => {
          this.error.set('Failed to remove some items');
        },
      });
    });
  }
}