import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
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
              @for (item of categories(); track $index) {
                <li>
                  <a
                    class="dropdown-item"
                    [routerLink]="['/products']"
                    [queryParams]="{ category_id: item._id }"
                  >
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

        <!-- Right -->
        <div class="d-flex align-items-center gap-2 ms-auto">
          <!-- Authenticated: User Menu -->
          @if (authService.isAuthenticated()) {
            <div class="dropdown">
              <button
                class="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-person-circle"></i>
                @if (authService.currentUser()) {
                  {{ authService.currentUser()?.name }}
                }
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <a class="dropdown-item" routerLink="/profile">
                    <i class="bi bi-person me-2"></i>Profile
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" routerLink="/orders">
                    <i class="bi bi-bag me-2"></i>My Orders
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" routerLink="/wishlist">
                    <i class="bi bi-heart me-2"></i>Wishlist
                  </a>
                </li>

                <!-- Admin-only section -->
                @if (isAdmin()) {
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <span class="dropdown-header text-uppercase small">
                      <i class="bi bi-shield-lock me-1"></i>Admin
                    </span>
                  </li>
                  <li>
                    <a class="dropdown-item" routerLink="/admin/categories">
                      <i class="bi bi-diagram-3 me-2"></i>Manage Categories
                    </a>
                  </li>
                  <!-- ✅ FIX: Manage Products link added -->
                  <li>
                    <a class="dropdown-item" routerLink="/admin/products">
                      <i class="bi bi-box-seam me-2"></i>Manage Products
                    </a>
                  </li>
                }

                <li><hr class="dropdown-divider" /></li>
                <li>
                  <button class="dropdown-item text-danger" (click)="logout()">
                    <i class="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </li>
              </ul>
            </div>
          } @else {
            <!-- Guest: Login Button -->
            <a class="btn btn-warning" routerLink="/auth/login"> Login </a>
          }

          <!-- Cart -->
          <button class="btn btn-outline-light position-relative" (click)="goToCart()">
            <i class="bi bi-cart4"></i>

            @if (cartItemCount() > 0) {
              <span
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              >
                {{ cartItemCount() }}
              </span>
            }
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
  private readonly categoryService = inject(HomeService);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly cartItemCount = computed(() => this.cartService.getCartItemCount());

  /** True only when the logged-in user has role 'admin' */
  readonly isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');

  constructor() {
    this.loadCategories();
    this.loadCart();
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

  loadCart() {
    if (this.authService.isAuthenticated()) {
      this.cartService.getCart().subscribe();
    }
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  logout(): void {
    this.authService.logout();
  }
}