import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Footer } from "./footer";

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div class="container">
        <a class="navbar-brand" routerLink="/home"> <i class="bi bi-shop me-2"></i>ITI Store </a>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/home" routerLinkActive="active"> Home </a>
            </li>
          </ul>

          <ul class="navbar-nav">
            @if (authService.isAuthenticated()) {
              <li class="nav-item dropdown">
                <button
                  type="button"
                  class="nav-link dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="bi bi-person-circle me-1"></i>
                  {{ authService.getCurrentUser()?.name }}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <button class="dropdown-item" type="button" (click)="onLogout()">
                      <i class="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </li>
            } @else {
              <li class="nav-item">
                <a class="nav-link" routerLink="/auth/login" routerLinkActive="active"> Login </a>
              </li>
              <li class="nav-item">
                <a class="btn btn-light btn-sm ms-2" routerLink="/auth/register"> Register </a>
              </li>
            }
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="py-4">
      <div class="container">
        <router-outlet></router-outlet>
      </div>
    </main>

    <!-- Footer -->
    <app-footer/>
  `,
  styles: [
    `
      /* Mobile navbar improvements */
      @media (max-width: 991px) {
        .navbar-collapse {
          background: var(--bs-primary);
          padding: 1rem;
          border-radius: 0.5rem;
          margin-top: 0.5rem;
        }

        .navbar-nav {
          gap: 0.5rem;
        }

        .nav-item {
          width: 100%;
        }

        .nav-link {
          padding: 0.75rem 1rem;
          border-radius: 0.25rem;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .dropdown-menu {
          margin-top: 0.5rem;
          border: none;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .btn-light {
          width: 100%;
          margin-top: 0.5rem;
        }
      }
    `,
  ],
})
export class MainLayoutComponent {
  readonly authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout();
  }
}
