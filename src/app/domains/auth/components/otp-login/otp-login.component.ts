import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthFacadeService } from '../../services/auth-facade.service';

@Component({
  selector: 'app-otp-login',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <div class="brand-icon">
              <i class="bi bi-phone"></i>
            </div>
            <h2>{{ 'auth.otpLogin.title' | translate }}</h2>
            <p class="text-muted">{{ 'auth.otpLogin.subtitle' | translate }}</p>
          </div>

          @if (error()) {
            <div class="alert alert-danger auth-alert" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              {{ error() }}
            </div>
          }

          @if (otpSent()) {
            <div class="alert alert-info auth-alert" role="alert">
              <i class="bi bi-envelope-paper me-2"></i>
              {{ 'auth.otpLogin.otpSent' | translate: {email: email()} }}
            </div>

            <form (ngSubmit)="onVerifyOtp()" class="auth-form">
              <div class="form-group">
                <label for="otp">{{ 'auth.otpLogin.otpLabel' | translate }}</label>
                <div class="input-group">
                  <span class="input-icon">
                    <i class="bi bi-shield-lock"></i>
                  </span>
                  <input
                    type="text"
                    id="otp"
                    class="form-control otp-input"
                    [placeholder]="'auth.otpLogin.otpPlaceholder' | translate"
                    [ngModel]="otp()"
                    (ngModelChange)="otp.set($event)"
                    name="otp"
                    required
                    maxlength="6"
                    minlength="6"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    [disabled]="isLoading()"
                  />
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-auth"
                [disabled]="isLoading() || !otp()"
              >
                @if (isLoading()) {
                  <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ 'auth.otpLogin.verifying' | translate }}
                } @else {
                  <i class="bi bi-check2-circle me-2"></i>
                  {{ 'auth.otpLogin.verifyButton' | translate }}
                }
              </button>

              <button
                type="button"
                class="btn btn-outline-resend"
                (click)="onRequestOtp()"
                [disabled]="isLoading()"
              >
                <i class="bi bi-arrow-repeat me-2"></i>
                {{ 'auth.otpLogin.resendOtp' | translate }}
              </button>
            </form>
          } @else {
            <form (ngSubmit)="onRequestOtp()" class="auth-form">
              <div class="form-group">
                <label for="email">{{ 'auth.otpLogin.emailLabel' | translate }}</label>
                <div class="input-group">
                  <span class="input-icon">
                    <i class="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    id="email"
                    class="form-control"
                    [placeholder]="'auth.otpLogin.emailPlaceholder' | translate"
                    [ngModel]="email()"
                    (ngModelChange)="email.set($event)"
                    name="email"
                    required
                    [disabled]="isLoading()"
                  />
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-auth"
                [disabled]="isLoading() || !email()"
              >
                @if (isLoading()) {
                  <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ 'auth.otpLogin.sendingOtp' | translate }}
                } @else {
                  <i class="bi bi-send me-2"></i>
                  {{ 'auth.otpLogin.sendOtpButton' | translate }}
                }
              </button>
            </form>
          }

          <div class="auth-footer">
            <a routerLink="/auth/login" class="back-link">
              <i class="bi bi-arrow-left me-2"></i>
              {{ 'auth.otpLogin.backToLogin' | translate }}
            </a>
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

    .otp-input {
      letter-spacing: 0.5rem;
      font-size: 1.5rem !important;
      text-align: center;
      font-weight: 600;
    }

    .otp-input::placeholder {
      letter-spacing: normal;
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
      margin-bottom: 1rem;
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

    .btn-outline-resend {
      width: 100%;
      padding: 0.75rem;
      font-size: 0.9rem;
      font-weight: 500;
      border-radius: 10px;
      border: 2px solid #e5e7eb;
      background: transparent;
      color: #6c757d;
      transition: all 0.3s ease;
    }

    .btn-outline-resend:hover:not(:disabled) {
      border-color: #667eea;
      color: #667eea;
    }

    .btn-outline-resend:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .back-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      transition: color 0.3s ease;
      display: inline-flex;
      align-items: center;
    }

    .back-link:hover {
      color: #764ba2;
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

      .otp-input {
        font-size: 1.25rem !important;
      }
    }
  `]
})
export class OtpLoginComponent {
  private readonly authFacade = inject(AuthFacadeService);
  private readonly translate = inject(TranslateService);

  readonly email = signal('');
  readonly otp = signal('');
  readonly error = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly otpSent = signal(false);

  onRequestOtp(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.authFacade.requestOtp$(this.email()).subscribe({
      next: (success) => {
        this.isLoading.set(false);
        if (success) {
          this.otpSent.set(true);
        } else {
          this.error.set(this.translate.instant('auth.otpLogin.errors.sendFailed'));
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.message || this.translate.instant('auth.otpLogin.errors.sendFailed'));
      },
    });
  }

  onVerifyOtp(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.authFacade.loginWithOtp$(this.email(), this.otp()).subscribe({
      next: (success) => {
        this.isLoading.set(false);
        if (!success) {
          this.error.set(this.translate.instant('auth.otpLogin.errors.invalidOtp'));
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.message || this.translate.instant('auth.otpLogin.errors.invalidOtp'));
      },
    });
  }
}
