import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '@app/domains/products/dto';
import { HomeService } from '../../services/home-service';

@Component({
  selector: 'app-best-seller-component',
  imports: [CurrencyPipe],
  template: `
    <div class="container mt-4 my-5">
      <h3 class="text-center my-4">Explore Best Seller Product</h3>
      <div class="row g-4">
        @if (loading()) {
          <p class="text-center py-5">Loading...</p>
        }
        @for (item of product(); track item._id) {
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <div class="card h-100 shadow-sm border-0">
              <img
                [src]="item.images[0]"
                class="card-img-top p-3"
                alt="{{ item.title }}"
                style="height:200px; object-fit:contain;"
              />

              <div class="card-body d-flex flex-column">
                <h6 class="card-title fw-bold text-truncate" title="{{ item.title }}">
                  {{ item.title }}
                </h6>
                <p class="card-text text-muted small text-truncate" title="{{ item.description }}">
                  {{ item.description }}
                </p>
                <div class="d-flex align-items-center gap-1 mb-2">
                  @for (star of [1, 2, 3, 4, 5]; track star) {
                    <i
                      class="bi"
                      [class.bi-star-fill]="star <= item.average_rating"
                      [class.bi-star-half]="
                        star > item.average_rating && star - 0.5 <= item.average_rating
                      "
                      [class.bi-star]="star - 0.5 > item.average_rating"
                      style="color:#FFC107;"
                    ></i>
                  }
                  <small class="text-muted">({{ item.ratings_count }})</small>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                  <span class="fw-bold text-primary">
                    {{ item.price | currency: 'EGP' : 'symbol' }}
                  </span>
                  <button class="btn btn-sm btn-outline-primary" (click)="navigateTo(item._id)">
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class BestSellerComponent {
  private bestSellerService = inject(HomeService);
  private router = inject(Router);
  product = signal<Product[]>([]);
  loading = signal(true);
  constructor() {
    this.loadProduct();
  }

  loadProduct() {
    this.bestSellerService.getBestSellerProduct().subscribe({
      next: (res) => {
        this.product.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  navigateTo(id: string) {
    this.router.navigateByUrl(`/products/${id}`);
  }
}
