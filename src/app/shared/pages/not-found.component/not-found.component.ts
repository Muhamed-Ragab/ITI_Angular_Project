import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found.component',
  standalone:true,
  imports: [RouterLink],
  template: `
  <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">

    <div class="text-center">
      <div class="mb-4">
        <i class="bi bi-bag-x display-1 text-warning"></i>
      </div>

      <h1 class="display-1 fw-bold text-dark">
        404
      </h1>

      <h3 class="fw-semibold mb-3">
        Sorry! Page Not Found
      </h3>

      <p class="text-muted mb-4">
        The page you are looking for might have been removed,<br>
        had its name changed, or is temporarily unavailable.
      </p>

      <div class="d-flex flex-wrap justify-content-center gap-3">

        <a routerLink="/home" class="btn btn-warning px-4">
          <i class="bi bi-house-door me-2"></i>
          Back to Home
        </a>

        <a routerLink="/products" class="btn btn-outline-dark px-4">
          <i class="bi bi-grid me-2"></i>
          Browse Products
        </a>

        <button class="btn btn-outline-secondary px-4" (click)="goBack()">
          <i class="bi bi-arrow-left me-2"></i>
          Go Back
        </button>

      </div>

      <div class="my-5">
        <hr class="w-50 mx-auto">
      </div>

    </div>

  </div>>
  `,
})
export class NotFoundComponent {
  goBack() {
    history.back();
  }
}
