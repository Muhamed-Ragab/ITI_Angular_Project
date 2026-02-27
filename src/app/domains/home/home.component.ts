import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container py-5">
      @if (authService.isLoading()) {
        <!-- Loading View -->
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card shadow-sm">
              <div class="card-body text-center p-5">
                <div class="spinner-border text-primary mb-3" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-muted">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      } @else if (authService.isAuthenticated()) {
        <!-- Logged In View -->
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card shadow-sm">
              <div class="card-body text-center p-5">
                <div class="text-success mb-4">
                  <i class="bi bi-check-circle-fill" style="font-size: 4rem;"></i>
                </div>
                <h2 class="mb-3">Welcome, {{ authService.currentUser()?.name }}!</h2>
                <p class="text-muted mb-4">You are successfully logged in.</p>
                <div class="alert alert-info">
                  <strong>Email:</strong> {{ authService.currentUser()?.email }}<br />
                  <strong>Role:</strong> {{ authService.currentUser()?.role }}
                </div>
                <div class="d-grid gap-2">
                  <a routerLink="/auth/login" class="btn btn-outline-primary">
                    <i class="bi bi-house me-2"></i>Go to Dashboard
                  </a>
                  <button (click)="onLogout()" class="btn btn-outline-danger">
                    <i class="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <!-- Logged Out View -->
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card shadow-sm">
              <div class="card-body text-center p-5">
                <div class="text-primary mb-4">
                  <i class="bi bi-shop" style="font-size: 4rem;"></i>
                </div>
                <h2 class="mb-3">Welcome to ITI Store</h2>
                <p class="text-muted mb-4">Your one-stop shop for everything you need.</p>
                <div class="d-grid gap-2">
                  <a routerLink="/auth/login" class="btn btn-primary">
                    <i class="bi bi-box-arrow-in-right me-2"></i>Login
                  </a>
                  <a routerLink="/auth/register" class="btn btn-outline-secondary">
                    <i class="bi bi-person-plus me-2"></i>Create Account
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [],
})
export class HomeComponent {
  readonly authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout();
  }
}
