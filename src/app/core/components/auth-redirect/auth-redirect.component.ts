import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-redirect',
  template: `
    <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `,
  standalone: true
})
export class AuthRedirectComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Wait for authentication to finish loading, then redirect appropriately
    const checkAuth = () => {
      if (this.auth.isLoading()) {
        // Still loading, check again in a moment
        setTimeout(checkAuth, 100);
        return;
      }

      if (this.auth.isAuthenticated()) {
        const user = this.auth.currentUser();
        if (user?.role === 'seller') {
          this.router.navigate(['/seller']);
        } else {
          this.router.navigate(['/home']);
        }
      } else {
        this.router.navigate(['/auth/login']);
      }
    };

    checkAuth();
  }
}