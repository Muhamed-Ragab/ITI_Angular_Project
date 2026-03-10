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
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <h2 class="card-title text-center mb-4">{{ 'auth.otpLogin.title' | translate }}</h2>

              @if (error()) {
                <div class="alert alert-danger" role="alert">
                  {{ error() }}
                </div>
              }

              @if (otpSent()) {
                <div class="alert alert-info" role="alert">
                  {{ 'auth.otpLogin.otpSent' | translate: {email: email()} }}
                </div>

                <form (ngSubmit)="onVerifyOtp()">
                  <div class="mb-3">
                    <label for="otp" class="form-label">{{ 'auth.otpLogin.otpLabel' | translate }}</label>
                    <input
                      type="text"
                      id="otp"
                      class="form-control"
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

                  <button
                    type="submit"
                    class="btn btn-primary w-100 mb-3"
                    [disabled]="isLoading() || !otp()"
                  >
                    @if (isLoading()) {
                      <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                      {{ 'auth.otpLogin.verifying' | translate }}
                    } @else {
                      {{ 'auth.otpLogin.verifyButton' | translate }}
                    }
                  </button>

                  <button
                    type="button"
                    class="btn btn-outline-secondary w-100"
                    (click)="onRequestOtp()"
                    [disabled]="isLoading()"
                  >
                    {{ 'auth.otpLogin.resendOtp' | translate }}
                  </button>
                </form>
              } @else {
                <form (ngSubmit)="onRequestOtp()">
                  <div class="mb-3">
                    <label for="email" class="form-label">{{ 'auth.otpLogin.emailLabel' | translate }}</label>
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

                  <button
                    type="submit"
                    class="btn btn-primary w-100 mb-3"
                    [disabled]="isLoading() || !email()"
                  >
                    @if (isLoading()) {
                      <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                      {{ 'auth.otpLogin.sendingOtp' | translate }}
                    } @else {
                      {{ 'auth.otpLogin.sendOtpButton' | translate }}
                    }
                  </button>
                </form>
              }

              <hr class="my-3" />

              <div class="text-center">
                <a routerLink="/auth/login" class="link-primary"> {{ 'auth.otpLogin.backToLogin' | translate }} </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
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
