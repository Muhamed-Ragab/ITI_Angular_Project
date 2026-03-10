import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthFacadeService } from '../../services/auth-facade.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink, TranslateModule],
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
                <p class="text-muted">{{ 'auth.verifyEmail.verifying' | translate }}</p>
              } @else if (success()) {
                <div class="text-success mb-3">
                  <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
                </div>
                <h3 class="mb-3">{{ 'auth.verifyEmail.success.title' | translate }}</h3>
                <p class="text-muted mb-4">
                  {{ 'auth.verifyEmail.success.message' | translate }}
                </p>
                <div class="spinner-border text-success spinner-border-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              } @else if (info()) {
                <div class="text-info mb-3">
                  <i class="bi bi-envelope-check-fill" style="font-size: 3rem;"></i>
                </div>
                <h3 class="mb-3">{{ 'auth.verifyEmail.info.title' | translate }}</h3>
                <p class="text-muted mb-4">
                  {{ 'auth.verifyEmail.info.message' | translate }}
                </p>
                <p class="text-muted small">
                  {{ 'auth.verifyEmail.info.sentTo' | translate }}<br />
                  <strong>{{ email() }}</strong>
                </p>
                <a routerLink="/auth/login" class="btn btn-primary">
                  <i class="bi bi-box-arrow-in-right me-2"></i>{{ 'auth.verifyEmail.goToLogin' | translate }}
                </a>
              } @else {
                <div class="text-danger mb-3">
                  <i class="bi bi-x-circle-fill" style="font-size: 3rem;"></i>
                </div>
                <h3 class="mb-3">{{ 'auth.verifyEmail.error.title' | translate }}</h3>
                <p class="text-muted mb-4">
                  {{ errorMessage() }}
                </p>
                <a routerLink="/auth/register" class="btn btn-primary"> {{ 'auth.verifyEmail.error.tryAgain' | translate }} </a>
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
