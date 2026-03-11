import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Category } from '../../dto/category.dto';
import { HomeService } from '../../services/home-service';

@Component({
  selector: 'app-category-component',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslateModule],
  template: `
    @if (loading()) {
      <p>{{ 'home.category.loading' | translate }}</p>
    }

    <h3 class="text-center my-4">{{ 'home.category.title' | translate }}</h3>

    <div class="row">
      @for (cat of categories(); track $index) {
        <div class="col-md-3 mb-3">
          <div class="card category-card h-100">
            <img [src]="cat.image" class="card-img-top" [alt]="cat.name" />

            <div class="card-body text-center">
              <h6 class="card-title">{{ cat.name }}</h6>
              <p class="card-text">{{ cat.description }}</p>

              <a
                [routerLink]="['/products']"
                [queryParams]="{ category_id: cat._id }"
                class="btn btn-primary"
              >
                {{ 'home.category.seeAll' | translate }}
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .category-card {
      height: 350px;
      display: flex;
      flex-direction: column;
    }

    .category-card img {
      height: 180px;
      object-fit: cover;
    }

    .category-card .card-body {
      display: flex;
      flex-direction: column;
    }

    .category-card .btn {
      margin-top: auto;
    }
  `,
})
export class CategoryComponent {
  private categoryService = inject(HomeService);

  readonly categories = signal<Category[]>([]);
  loading = signal(true);

  constructor() {
    this.loadCategories();
  }
  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
