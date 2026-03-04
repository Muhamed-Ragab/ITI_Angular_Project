import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '@app/domains/home/dto/category.dto';
import { HomeService } from '@app/domains/home/services/home-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `<nav class="navbar navbar-expand-lg navbar-dark bg-dark py-2">
    <div class="container">
      <!-- Logo -->
      <a class="navbar-brand d-flex align-items-center" routerLink="/">
        <img src="lgo2.png" class="logo-img me-2" alt="SouqMasr Logo" />
      </a>

      <!-- Mobile Toggle -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavbar"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="mainNavbar">
        <ul class="navbar-nav me-3">
          <!-- Categories -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown">
              Categories
            </a>

            <ul class="dropdown-menu">
              @for (item of categories(); track item.id) {
                <li>
                  <a class="dropdown-item" [routerLink]="['/products']" [queryParams]="{ category_id: item.id}">
                    {{ item.name }}
                  </a>
                </li>
              }
            </ul>
          </li>

          <!-- Language -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown">
              Language
            </a>

            <ul class="dropdown-menu">
              <li><a class="dropdown-item">English</a></li>
              <li><a class="dropdown-item">Arabic</a></li>
            </ul>
          </li>
        </ul>

        <!-- Search -->
        <form class="d-flex flex-grow-1 mx-lg-3 my-2 my-lg-0">
          <input class="form-control me-2" type="search" placeholder="Search for products" />

          <button class="btn btn-warning">Search</button>
        </form>

        <!-- Right -->
        <div class="d-flex align-items-center gap-2">
          <a class="btn btn-warning" routerLink="/auth/login"> Login </a>

          <button class="btn btn-outline-light position-relative">
            <i class="bi bi-cart4"></i>

            <span
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            >
              5
            </span>
          </button>
        </div>
      </div>
    </div>
  </nav>`,
  styles: `
    .logo-img {
      max-height: 7.75rem;
      width: 8.75rem;
      display: block;
    }
  `,
})
export class Header {
  // categories = ['Electronics', 'Fasion', 'home'];

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
