import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthFacadeService } from '../../services/auth-facade.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body p-4 text-center">
              @if (loading()) {
                <div class="spinner-border text-primary mb-3" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-muted">Verifying your email...</p>
              } @else if (success()) {
                <div class="text-success mb-3">
                  <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
                </div>
                <h3 class="mb-3">Email Verified!</h3>
                <p class="text-muted mb-4">
                  Your email has been successfully verified.<br />
                  Redirecting you to login...
                </p>
                <div class="spinner-border text-success spinner-border-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              } @else if (info()) {
                <div class="text-info mb-3">
                  <i class="bi bi-envelope-check-fill" style="font-size: 3rem;"></i>
                </div>
                <h3 class="mb-3">Registration Successful!</h3>
                <p class="text-muted mb-4">
                  <strong>Please check your email</strong> to verify your account.
                </p>
                <p class="text-muted small">
                  We've sent a verification link to<br />
                  <strong>{{ email() }}</strong>
                </p>
                <a routerLink="/auth/login" class="btn btn-primary">
                  <i class="bi bi-box-arrow-in-right me-2"></i>Go to Login
                </a>
              } @else {
                <div class="text-danger mb-3">
                  <i class="bi bi-x-circle-fill" style="font-size: 3rem;"></i>
                </div>
                <h3 class="mb-3">Verification Failed</h3>
                <p class="text-muted mb-4">
                  {{ errorMessage() }}
                </p>
                <a routerLink="/auth/register" class="btn btn-primary"> Try Again </a>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class VerifyEmailComponent {
  private readonly authFacade = inject(AuthFacadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly success = signal(false);
  readonly info = signal(false);
  readonly errorMessage = signal('');
  readonly email = signal('');

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (email) {
      // User just registered, show info message
      this.email.set(email);
      this.loading.set(false);
      this.info.set(true);
      return;
    }

    if (token) {
      this.verifyEmailAndAutoLogin(token);
    } else {
      this.loading.set(false);
      this.errorMessage.set('No verification token provided');
    }
  }

  private verifyEmailAndAutoLogin(token: string): void {
    this.authFacade.verifyEmail$(token).subscribe({
      next: (success) => {
        if (success) {
          this.success.set(true);
          this.loading.set(false);
          // Redirect to login page with verified flag after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/auth/login'], {
              queryParams: { verified: 'true', email: this.email() },
            });
          }, 2000);
        } else {
          this.loading.set(false);
          this.errorMessage.set('Invalid or expired verification token');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.success.set(false);
        this.errorMessage.set(
          err?.message || 'Verification failed. Please check your email and try again.',
        );
      },
    });
  }
}
