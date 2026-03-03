import { Component, input } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { Product } from '../../dto';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe, NgClass , RouterLink],
  template: `
    <a [routerLink]="['/products', product().id]" class="text-decoration-none text-dark">
    <div class="card h-100 shadow-sm border-0">
      <img
        [src]="product().images[0]"
        [alt]="product().name"
        class="card-img-top"
        style="height: 200px; object-fit: cover;"
      />
      <div class="card-body d-flex flex-column">
        <span class="badge bg-secondary mb-2 w-fit">{{ product().category.name }}</span>
        <h6 class="card-title fw-semibold">{{ product().name }}</h6>
        <p class="text-muted small mb-1">by {{ product().seller.store_name }}</p>
        <p class="fw-bold text-primary fs-5 mb-1">{{ product().price | currency }}</p>

        <div class="d-flex align-items-center gap-1 mb-2">
          <i class="bi bi-star-fill text-warning small"></i>
          <span class="small">{{ product().average_rating }}</span>
          <span class="text-muted small">({{ product().ratings_count }})</span>
        </div>

        <span
          class="badge mt-auto"
          [ngClass]="product().stock > 0 ? 'bg-success' : 'bg-danger'"
        >
          {{ product().stock > 0 ? 'In Stock' : 'Out of Stock' }}
        </span>

      </div>
    </div>
  `,
})
export class ProductCardComponent {
  readonly product = input.required<Product>(); // ← new Angular input() signal style
}