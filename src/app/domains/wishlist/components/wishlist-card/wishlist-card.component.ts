import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
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
      <div [routerLink]="['/products', item().productId]" style="cursor: pointer;">
        <img
          [src]="item().image"
          [alt]="item().name"
          class="card-img-top"
          style="height: 200px; object-fit: cover;"
        />
      </div>

      <div class="card-body d-flex flex-column">
        <!-- Name -->
        <h6
          class="card-title fw-semibold text-dark"
          [routerLink]="['/products', item().productId]"
          style="cursor: pointer;"
        >
          {{ item().name }}
        </h6>

        <p class="fw-bold text-primary fs-5 mb-1">{{ item().price | currency }}</p>

        <small class="text-muted mb-3">
          <i class="bi bi-clock me-1"></i>
          Added {{ item().addedAt | date: 'mediumDate' }}
        </small>

        <!-- Actions -->
        <div class="d-flex gap-2 mt-auto">
          <button
            class="btn btn-primary btn-sm flex-grow-1"
            [routerLink]="['/products', item().productId]"
          >
            <i class="bi bi-eye me-1"></i>View Product
          </button>
          <button
            class="btn btn-outline-danger btn-sm"
            (click)="remove.emit(item().productId)"
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
}
