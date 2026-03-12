import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthFacadeService } from '../../services/auth-facade.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            @if (loading()) {
              <div class="status-icon loading">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <h2>{{ 'auth.verifyEmail.verifying' | translate }}</h2>
            } @else if (success()) {
              <div class="status-icon success">
                <i class="bi bi-check-circle-fill"></i>
              </div>
              <h2>{{ 'auth.verifyEmail.success.title' | translate }}</h2>
              <p class="text-muted">{{ 'auth.verifyEmail.success.message' | translate }}</p>
              <div class="auto-redirect">
                <div class="spinner-border spinner-border-sm text-success me-2" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <span>{{ 'auth.verifyEmail.redirecting' | translate }}</span>
              </div>
            } @else if (info()) {
              <div class="status-icon info">
                <i class="bi bi-envelope-check-fill"></i>
              </div>
              <h2>{{ 'auth.verifyEmail.info.title' | translate }}</h2>
              <p class="text-muted">{{ 'auth.verifyEmail.info.message' | translate }}</p>
              <div class="email-info">
                <small class="text-muted">{{ 'auth.verifyEmail.info.sentTo' | translate }}</small>
                <strong class="d-block">{{ email() }}</strong>
              </div>
              <a routerLink="/auth/login" class="btn btn-auth mt-3">
                <i class="bi bi-box-arrow-in-right me-2"></i>
                {{ 'auth.verifyEmail.goToLogin' | translate }}
              </a>
            } @else {
              <div class="status-icon error">
                <i class="bi bi-x-circle-fill"></i>
              </div>
              <h2>{{ 'auth.verifyEmail.error.title' | translate }}</h2>
              <p class="text-muted">{{ errorMessage() }}</p>
              <a routerLink="/auth/register" class="btn btn-auth">
                <i class="bi bi-arrow-repeat me-2"></i>
                {{ 'auth.verifyEmail.error.tryAgain' | translate }}
              </a>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem 1rem;
    }

    .auth-container {
      width: 100%;
      max-width: 440px;
    }

    .auth-card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      padding: 2.5rem;
      animation: slideUp 0.4s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .auth-header {
      text-align: center;
    }

    .status-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .status-icon.loading {
      background: #f3f4f6;
    }

    .status-icon.success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
    }

    .status-icon.success i {
      font-size: 2.5rem;
      color: #fff;
    }

    .status-icon.info {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
    }

    .status-icon.info i {
      font-size: 2.5rem;
      color: #fff;
    }

    .status-icon.error {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
    }

    .status-icon.error i {
      font-size: 2.5rem;
      color: #fff;
    }

    .auth-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 0.75rem;
    }

    .auth-header p {
      font-size: 0.95rem;
      color: #6c757d;
      line-height: 1.6;
    }

    .auto-redirect {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 1rem;
      font-size: 0.9rem;
      color: #6c757d;
    }

    .email-info {
      background: #f9fafb;
      border-radius: 10px;
      padding: 1rem;
      margin-top: 1rem;
    }

    .email-info strong {
      color: #1a1a2e;
      font-size: 1rem;
      margin-top: 0.25rem;
    }

    .btn-auth {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.875rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: #fff;
      text-decoration: none;
      transition: all 0.3s ease;
      margin-top: 1.5rem;
    }

    .btn-auth:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35);
      color: #fff;
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 1.75rem;
      }

      .status-icon {
        width: 64px;
        height: 64px;
      }

      .status-icon.success i,
      .status-icon.info i,
      .status-icon.error i {
        font-size: 2rem;
      }

      .auth-header h2 {
        font-size: 1.25rem;
      }
    }
  `]
})
export class VerifyEmailComponent {
  private readonly authFacade = inject(AuthFacadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

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
      this.errorMessage.set(this.translate.instant('auth.verifyEmail.error.noToken'));
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
          this.errorMessage.set(this.translate.instant('auth.verifyEmail.error.invalidToken'));
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.success.set(false);
        this.errorMessage.set(
          err?.message || this.translate.instant('auth.verifyEmail.error.verificationFailed'),
        );
      },
    });
  }
}
