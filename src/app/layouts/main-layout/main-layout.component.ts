import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Footer } from './footer';
import { Header } from './header';
import { ChatbotWidgetComponent } from '@domains/chatbot/components/chatbot-widget/chatbot-widget.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, ChatbotWidgetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Navbar -->
    <app-header />

    <!-- Main Content -->
    <main class="py-4">
      <div class="container">
        <router-outlet></router-outlet>
      </div>
    </main>

    <!-- Footer -->
    <app-footer />

    <!-- Chatbot Widget -->
    <app-chatbot-widget />
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      main {
        flex: 1;
      }

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
