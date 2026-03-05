import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistItem } from '../../dto';

@Component({
  selector: 'app-wishlist-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <div class="card h-100 shadow-sm border-0">
      <!-- Image — routerLink on div works fine -->
      <div [routerLink]="['/products', item().product_id]" style="cursor: pointer;">
        <img
          [src]="imageSrc"
          [alt]="displayName"
          class="card-img-top"
          style="height: 200px; object-fit: cover;"
        />
      </div>

      <div class="card-body d-flex flex-column">
        <!-- Name -->
        <h6
          class="card-title fw-semibold text-dark"
          [routerLink]="['/products', item().product_id]"
          style="cursor: pointer;"
        >
          {{ displayName }}
        </h6>

        <p class="fw-bold text-primary fs-5 mb-1">{{ displayPrice | currency }}</p>

        <small class="text-muted mb-3">
          <i class="bi bi-clock me-1"></i>
          Added {{ item().addedAt | date: 'mediumDate' }}
        </small>

        <!-- Actions -->
        <div class="d-flex gap-2 mt-auto">
          <button
            class="btn btn-primary btn-sm grow"
            [routerLink]="['/products', item().product_id]"
          >
            <i class="bi bi-eye me-1"></i>View Product
          </button>
          <button
            class="btn btn-outline-danger btn-sm"
            (click)="remove.emit(item().product_id)"
            title="Remove from wishlist"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class WishlistCardComponent {
  readonly item = input.required<WishlistItem>();
  readonly remove = output<string>();

  get imageSrc(): string {
    return this.item().image || 'https://placehold.co/600x400?text=No+Image';
  }

  get displayName(): string {
    return this.item().name || 'Unnamed product';
  }

  get displayPrice(): number {
    const price = this.item().price;
    return Number.isFinite(price) ? price : 0;
  }
}
