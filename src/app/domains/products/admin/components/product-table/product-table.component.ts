import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
// ✅ FIX: DecimalPipe + CurrencyPipe added — required for | number and | currency pipes in template
import { DecimalPipe, CurrencyPipe } from '@angular/common';
import { AdminProduct, AdminProductPagination } from '../../dto';

@Component({
  selector: 'app-admin-product-table',
  standalone: true,
  // ✅ FIX: was empty [], now has the two pipes the template uses
  imports: [DecimalPipe, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Table -->
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-dark">
          <tr>
            <th style="width:60px">Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Seller</th>
            <th class="text-end">Price</th>
            <th class="text-center">Stock</th>
            <th class="text-center">Rating</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (p of products(); track productId(p)) {
            <tr>
              <!-- Thumbnail -->
              <td>
                @if (firstImage(p)) {
                  <img
                    [src]="firstImage(p)"
                    [alt]="productName(p)"
                    class="rounded"
                    style="width:48px;height:48px;object-fit:cover"
                    (error)="onImgError($event)"
                  />
                } @else {
                  <div
                    class="rounded bg-secondary d-flex align-items-center justify-content-center"
                    style="width:48px;height:48px"
                  >
                    <i class="bi bi-image text-white"></i>
                  </div>
                }
              </td>

              <!-- Name + description snippet -->
              <td>
                <div class="fw-semibold">{{ productName(p) }}</div>
                <small class="text-muted">{{ snippet(p.description) }}</small>
              </td>

              <!-- Category -->
              <td>
                <span class="badge bg-primary bg-opacity-10 text-primary">
                  {{ categoryName(p) }}
                </span>
              </td>

              <!-- Seller -->
              <td class="text-muted small">{{ sellerName(p) }}</td>

              <!-- Price -->
              <td class="text-end fw-semibold">{{ p.price | currency }}</td>

              <!-- Stock -->
              <td class="text-center">
                @if (stockQty(p) === 0) {
                  <span class="badge bg-danger">Out of stock</span>
                } @else if (stockQty(p) <= 10) {
                  <span class="badge bg-warning text-dark">{{ stockQty(p) }} low</span>
                } @else {
                  <span class="badge bg-success">{{ stockQty(p) }}</span>
                }
              </td>

              <!-- Rating -->
              <td class="text-center">
                <i class="bi bi-star-fill text-warning me-1" style="font-size:.75rem"></i>
                <small>{{ p.average_rating | number:'1.1-1' }} ({{ p.ratings_count }})</small>
              </td>

              <!-- Actions -->
              <td class="text-end">
                <div class="d-flex gap-1 justify-content-end">
                  <button
                    class="btn btn-outline-primary btn-sm"
                    title="Edit"
                    (click)="edit.emit(p)"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="btn btn-outline-danger btn-sm"
                    title="Delete"
                    (click)="delete.emit(p)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          }

          @if (products().length === 0) {
            <tr>
              <td colspan="8" class="text-center py-5 text-muted">
                <i class="bi bi-inbox" style="font-size:2rem"></i>
                <p class="mt-2 mb-0">No products found.</p>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    @if (pagination() && pagination()!.pages > 1) {
      <div class="d-flex align-items-center justify-content-between px-3 py-2 border-top">
        <small class="text-muted">
          Showing {{ pageStart() }}–{{ pageEnd() }} of {{ pagination()!.total }} products
        </small>
        <div class="d-flex gap-1">
          <button
            class="btn btn-outline-secondary btn-sm"
            [disabled]="pagination()!.page <= 1"
            (click)="pageChange.emit(pagination()!.page - 1)"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
          @for (pg of pageNumbers(); track pg) {
            <button
              class="btn btn-sm"
              [class.btn-primary]="pg === pagination()!.page"
              [class.btn-outline-secondary]="pg !== pagination()!.page"
              (click)="pageChange.emit(pg)"
            >{{ pg }}</button>
          }
          <button
            class="btn btn-outline-secondary btn-sm"
            [disabled]="pagination()!.page >= pagination()!.pages"
            (click)="pageChange.emit(pagination()!.page + 1)"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    }
  `,
})
export class AdminProductTableComponent {
  readonly products = input.required<AdminProduct[]>();
  readonly pagination = input<AdminProductPagination | null>(null);

  readonly edit = output<AdminProduct>();
  readonly delete = output<AdminProduct>();
  readonly pageChange = output<number>();

  productId(p: AdminProduct): string { return (p.id ?? p._id) as string; }
  productName(p: AdminProduct): string { return (p.name ?? p.title) as string; }
  categoryName(p: AdminProduct): string {
    const c = p.category ?? p.category_id;
    return c?.name ?? '—';
  }
  sellerName(p: AdminProduct): string {
    const s = p.seller ?? p.seller_id;
    return s?.store_name ?? s?.name ?? '—';
  }
  stockQty(p: AdminProduct): number { return p.stock ?? p.stock_quantity ?? 0; }
  firstImage(p: AdminProduct): string | null { return p.images?.[0] ?? null; }
  snippet(text: string): string {
    return text?.length > 60 ? text.slice(0, 60) + '…' : text ?? '';
  }
  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/e2e8f0/94a3b8?text=?';
  }

  pageStart(): number {
    const p = this.pagination();
    return p ? (p.page - 1) * p.limit + 1 : 0;
  }
  pageEnd(): number {
    const p = this.pagination();
    return p ? Math.min(p.page * p.limit, p.total) : 0;
  }
  pageNumbers(): number[] {
    const p = this.pagination();
    if (!p) return [];
    const pages: number[] = [];
    for (let i = Math.max(1, p.page - 2); i <= Math.min(p.pages, p.page + 2); i++) {
      pages.push(i);
    }
    return pages;
  }
}