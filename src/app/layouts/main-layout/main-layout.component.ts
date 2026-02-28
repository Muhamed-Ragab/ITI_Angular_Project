import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Header } from "./header";

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, Header],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Navbar -->
   <app-header/>

    <!-- Main Content -->
    <main class="py-4">
      <div class="container">
        <router-outlet></router-outlet>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-dark text-light py-4 mt-auto">
      <div class="container">
        <div class="row">
          <div class="col-md-4 mb-3 mb-md-0">
            <h5><i class="bi bi-shop me-2"></i>ITI Store</h5>
            <p class="text-muted">Your one-stop shop for everything you need.</p>
          </div>
          <div class="col-md-4 mb-3 mb-md-0">
            <h6>Quick Links</h6>
            <ul class="list-unstyled">
              <li><a routerLink="/home" class="text-muted text-decoration-none">Home</a></li>
              <li><a routerLink="/auth/login" class="text-muted text-decoration-none">Login</a></li>
              <li>
                <a routerLink="/auth/register" class="text-muted text-decoration-none">Register</a>
              </li>
            </ul>
          </div>
          <div class="col-md-4">
            <h6>Contact</h6>
            <ul class="list-unstyled text-muted">
              <li><i class="bi bi-envelope me-2"></i>info@itistore.com</li>
              <li><i class="bi bi-telephone me-2"></i>+1234567890</li>
            </ul>
          </div>
        </div>
        <hr class="my-3" />
        <div class="text-center text-muted">
          <small>&copy; 2026 ITI Store. All rights reserved.</small>
        </div>
      </div>
    </footer>
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
