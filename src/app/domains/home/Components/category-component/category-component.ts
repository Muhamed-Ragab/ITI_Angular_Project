import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../dto/category.dto';
import { HomeService } from '../../services/home-service';

@Component({
  selector: 'app-category-component',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    @if (loading()) {
      <p>Loading...</p>
    }

    <h3 class="text-center my-4">What are you shopping for today?</h3>

    <div class="row">
      @for (cat of categories(); track cat.id) {
        <div class="col-md-3 mb-3">
          <div class="card category-card">
            <img src="cat1.jpg" class="card-img-top" [alt]="cat.name" />

            <div class="card-body text-center">
              <h6 class="card-title">{{ cat.name }}</h6>
              <h6 class="card-title">{{ cat.description }}</h6>

              <a
                [routerLink]="['/products']"
                [queryParams]="{ category_id: cat.id }"
                class="btn btn-primary"
              >
                See All Products
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CategoryComponent {
  private categoryService = inject(HomeService);

  categories = signal<Category[]>([]);
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
