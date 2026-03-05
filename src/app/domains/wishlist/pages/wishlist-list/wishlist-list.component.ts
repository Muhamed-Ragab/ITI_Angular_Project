import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { GuestWishlistService } from '@core/services/guest-wishlist.service';
import { ProductService } from '@core/services/product.service';
import { WishlistService } from '@core/services/wishlist.service';
import { WishlistCardComponent } from '../../components/wishlist-card/wishlist-card.component';
import { WishlistApiItem, WishlistItem } from '../../dto';

@Component({
  selector: 'app-wishlist-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WishlistCardComponent, RouterLink],
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

      @if (viewState() === 'loading') {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }

      @if (viewState() === 'error' && error()) {
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

      @if (viewState() === 'empty') {
        <div class="text-center py-5">
          <i class="bi bi-heart text-muted" style="font-size: 4rem;"></i>
          <h5 class="mt-3 text-muted">Your wishlist is empty</h5>
          <p class="text-muted">Start saving products you love!</p>
          <a routerLink="/products" class="btn btn-primary mt-2">
            <i class="bi bi-grid me-2"></i>Browse Products
          </a>
        </div>
      }

      @if (viewState() === 'success') {
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          @for (item of wishlist(); track $index) {
            <div class="col">
              <app-wishlist-card [item]="item" (remove)="onRemove($event)" />
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class WishlistListComponent implements OnInit {
  private readonly wishlistService = inject(WishlistService);
  private readonly guestWishlistService = inject(GuestWishlistService);
  private readonly authService = inject(AuthService);
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  readonly wishlist = signal<WishlistItem[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMsg = signal<string | null>(null);
  readonly viewState = signal<'loading' | 'empty' | 'success' | 'error'>('loading');

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.viewState.set('loading');

    if (this.authService.isAuthenticated()) {
      this.wishlistService
        .getWishlist()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            console.log(res);

            const items = this.extractAndMapWishlist(res.data);
            this.wishlist.set(items);
            this.viewState.set(items.length > 0 ? 'success' : 'empty');
            this.isLoading.set(false);
          },
          error: (err) => {
            this.error.set(err.message || 'Failed to load wishlist');
            this.viewState.set('error');
            this.isLoading.set(false);
          },
        });
    } else {
      const guestItemIds = this.guestWishlistService.getWishlistItems();
      if (guestItemIds.length === 0) {
        this.wishlist.set([]);
        this.viewState.set('empty');
        this.isLoading.set(false);
        return;
      }

      this.productService
        .getProductsByIds(guestItemIds)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res: any) => {
            const mappedItems: WishlistItem[] = (res.data || []).map((product: any) => ({
              product_id: String(product?._id ?? ''),
              name: String(product?.title ?? product?.name ?? 'Unnamed product'),
              price: Number(product?.price ?? 0),
              image: String(
                product?.images?.[0] ??
                  product?.image ??
                  'https://placehold.co/600x400?text=No+Image',
              ),
              addedAt: new Date().toISOString(),
            }));
            this.wishlist.set(mappedItems);
            this.viewState.set(mappedItems.length > 0 ? 'success' : 'empty');
            this.isLoading.set(false);
          },
          error: (err: any) => {
            this.error.set(err.message || 'Failed to load guest wishlist');
            this.viewState.set('error');
            this.isLoading.set(false);
          },
        });
    }
  }

  onRemove(productId: string): void {
    if (this.authService.isAuthenticated()) {
      this.wishlistService
        .removeFromWishlist(productId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.wishlist.update((list) => list.filter((i) => i.product_id !== productId));
            this.viewState.set(this.wishlist().length > 0 ? 'success' : 'empty');
            this.successMsg.set('Item removed from wishlist');
            setTimeout(() => this.successMsg.set(null), 3000);
          },
          error: (err) => {
            this.error.set(err.message || 'Failed to remove item');
            this.viewState.set('error');
          },
        });
    } else {
      this.guestWishlistService.removeFromWishlist(productId);
      this.wishlist.update((list) => list.filter((i) => i.product_id !== productId));
      this.viewState.set(this.wishlist().length > 0 ? 'success' : 'empty');
      this.successMsg.set('Item removed from wishlist');
      setTimeout(() => this.successMsg.set(null), 3000);
    }
  }

  clearAll(): void {
    const ids = this.wishlist().map((i) => i.product_id);
    let completed = 0;

    ids.forEach((id) => {
      this.wishlistService
        .removeFromWishlist(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.wishlist.update((list) => list.filter((item) => item.product_id !== id));
            completed++;
            if (completed === ids.length && this.wishlist().length === 0) {
              this.viewState.set('empty');
              this.successMsg.set('Wishlist cleared');
              setTimeout(() => this.successMsg.set(null), 3000);
            }
          },
          error: (err) => {
            this.error.set(err.message || 'Failed to clear wishlist');
            this.viewState.set('error');
          },
        });
    });
  }

  private extractAndMapWishlist(data: unknown): WishlistItem[] {
    const rawItems = Array.isArray(data)
      ? data
      : typeof data === 'object' &&
          data !== null &&
          Array.isArray((data as { wishlist?: unknown[] }).wishlist)
        ? (data as { wishlist: unknown[] }).wishlist
        : [];

    return rawItems
      .map((item) => this.toWishlistItem(item as WishlistApiItem))
      .filter((item): item is WishlistItem => item.product_id.length > 0);
  }

  private toWishlistItem(item: WishlistApiItem): WishlistItem {
    const productId = String(item?.productId ?? item?.product_id ?? item?._id ?? item?.id ?? '');
    const name = String(item?.name ?? item?.title ?? 'Unnamed product');
    const price = Number(item?.price ?? 0);
    const image = String(
      item?.image ?? item?.images?.[0] ?? 'https://placehold.co/600x400?text=No+Image',
    );
    const addedAt = String(item?.addedAt ?? new Date().toISOString());

    return {
      product_id: productId,
      name,
      price: Number.isFinite(price) ? price : 0,
      image,
      addedAt,
    };
  }
}
