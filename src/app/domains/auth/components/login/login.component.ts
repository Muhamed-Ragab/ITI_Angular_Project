import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthFacadeService } from '../../services/auth-facade.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <div class="brand-icon">
              <i class="bi bi-shop"></i>
            </div>
            <h2>{{ 'auth.login.title' | translate }}</h2>
            <p class="text-muted">{{ 'auth.login.subtitle' | translate }}</p>
          </div>

          @if (verified()) {
            <div class="alert alert-success auth-alert" role="alert">
              <i class="bi bi-check-circle-fill me-2"></i>
              {{ 'auth.login.emailVerified' | translate }}
            </div>
          }

          @if (error()) {
            <div class="alert alert-danger auth-alert" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="onLogin()" class="auth-form">
            <div class="form-group">
              <label for="email">{{ 'auth.login.emailLabel' | translate }}</label>
              <div class="input-group">
                <span class="input-icon">
                  <i class="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  id="email"
                  class="form-control"
                  [placeholder]="'auth.login.emailPlaceholder' | translate"
                  [ngModel]="email()"
                  (ngModelChange)="email.set($event)"
                  name="email"
                  required
                  [disabled]="isLoading()"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="password">{{ 'auth.login.passwordLabel' | translate }}</label>
              <div class="input-group">
                <span class="input-icon">
                  <i class="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  id="password"
                  class="form-control"
                  [placeholder]="'auth.login.passwordPlaceholder' | translate"
                  [ngModel]="password()"
                  (ngModelChange)="password.set($event)"
                  name="password"
                  required
                  [disabled]="isLoading()"
                />
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-auth"
              [disabled]="isLoading() || !email() || !password()"
            >
              @if (isLoading()) {
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ 'auth.login.loggingIn' | translate }}
              } @else {
                <i class="bi bi-box-arrow-in-right me-2"></i>
                {{ 'auth.login.loginButton' | translate }}
              }
            </button>

            <div class="text-center mt-3">
              <a routerLink="/auth/otp-login" class="link-otp">
                <i class="bi bi-phone me-1"></i>
                {{ 'auth.login.loginWithOtp' | translate }}
              </a>
            </div>

            <div class="divider">
              <span>{{ 'auth.login.or' | translate }}</span>
            </div>

            <button type="button" class="btn btn-google" (click)="onGoogleLogin()">
              <i class="bi bi-google"></i>
              {{ 'auth.login.continueWithGoogle' | translate }}
            </button>

            <div class="auth-footer">
              <p class="mb-0">{{ 'auth.login.noAccount' | translate }}</p>
              <a routerLink="/auth/register" class="btn btn-outline-auth">
                {{ 'auth.login.registerButton' | translate }}
              </a>
            </div>
          </form>
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
      margin-bottom: 2rem;
    }

    .brand-icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .brand-icon i {
      font-size: 1.75rem;
      color: #fff;
    }

    .auth-header h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 0.5rem;
    }

    .auth-header p {
      font-size: 0.95rem;
      color: #6c757d;
    }

    .auth-alert {
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      font-size: 0.9rem;
    }

    .auth-alert i {
      font-size: 1.1rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      font-weight: 500;
      color: #1a1a2e;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .input-group {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      font-size: 1.1rem;
      z-index: 10;
      transition: color 0.3s ease;
    }

    .input-group:focus-within .input-icon {
      color: #667eea;
    }

    .form-control {
      padding: 0.875rem 1rem 0.875rem 2.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      background: #f9fafb;
    }

    .form-control:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      background: #fff;
      outline: none;
    }

    .form-control::placeholder {
      color: #9ca3af;
    }

    .form-control:disabled {
      background: #f3f4f6;
      opacity: 0.7;
    }

    .btn-auth {
      width: 100%;
      padding: 0.875rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: #fff;
      transition: all 0.3s ease;
      margin-top: 0.5rem;
    }

    .btn-auth:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35);
    }

    .btn-auth:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-auth:disabled {
      background: #c4b5fd;
      opacity: 0.7;
      cursor: not-allowed;
    }

    .link-otp {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }

    .link-otp:hover {
      color: #764ba2;
    }

    .divider {
      display: flex;
      align-items: center;
      margin: 1.5rem 0;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e5e7eb;
    }

    .divider span {
      padding: 0 1rem;
      color: #9ca3af;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .btn-google {
      width: 100%;
      padding: 0.875rem;
      font-size: 0.95rem;
      font-weight: 500;
      border-radius: 10px;
      border: 2px solid #e5e7eb;
      background: #fff;
      color: #1a1a2e;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-google:hover {
      border-color: #dc3545;
      background: #fff5f5;
      color: #dc3545;
    }

    .btn-google i {
      font-size: 1.1rem;
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .auth-footer p {
      color: #6c757d;
      font-size: 0.9rem;
      margin-bottom: 0.75rem;
    }

    .btn-outline-auth {
      display: inline-block;
      width: 100%;
      padding: 0.75rem;
      font-size: 0.95rem;
      font-weight: 500;
      border-radius: 10px;
      border: 2px solid #667eea;
      background: transparent;
      color: #667eea;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .btn-outline-auth:hover {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: transparent;
      color: #fff;
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 1.75rem;
      }

      .brand-icon {
        width: 56px;
        height: 56px;
      }

      .brand-icon i {
        font-size: 1.5rem;
      }

      .auth-header h2 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class LoginComponent {
  private readonly authFacade = inject(AuthFacadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);

  readonly email = signal('');
  readonly password = signal('');
  readonly error = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly verified = signal(this.route.snapshot.queryParamMap.get('verified') === 'true');

  onLogin(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.authFacade
      .login$({
        email: this.email(),
        password: this.password(),
      })
      .subscribe({
        next: (success) => {
          this.isLoading.set(false);
          if (!success) {
            this.error.set(this.translate.instant('auth.login.errors.invalidCredentials'));
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set(err.message || this.translate.instant('auth.login.errors.loginFailed'));
        },
      });
  }

  onGoogleLogin(): void {
    window.location.href = this.authFacade.initiateGoogleOAuth();
  }
}
