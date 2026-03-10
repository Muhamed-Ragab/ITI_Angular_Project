import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthFacadeService } from '../../services/auth-facade.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <h2 class="card-title text-center mb-4">{{ 'auth.register.title' | translate }}</h2>

              @if (error()) {
                <div class="alert alert-danger" role="alert">
                  {{ error() }}
                </div>
              }

              @if (success()) {
                <div class="alert alert-success" role="alert">
                  {{ 'auth.register.successMessage' | translate }}
                </div>
              }

              <form (ngSubmit)="onRegister()">
                <div class="mb-3">
                  <label for="name" class="form-label">{{ 'auth.register.nameLabel' | translate }}</label>
                  <input
                    type="text"
                    id="name"
                    class="form-control"
                    [placeholder]="'auth.register.namePlaceholder' | translate"
                    [ngModel]="name()"
                    (ngModelChange)="name.set($event)"
                    name="name"
                    required
                    [disabled]="isLoading() || success()"
                  />
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">{{ 'auth.register.emailLabel' | translate }}</label>
                  <input
                    type="email"
                    id="email"
                    class="form-control"
                    [placeholder]="'auth.register.emailPlaceholder' | translate"
                    [ngModel]="email()"
                    (ngModelChange)="email.set($event)"
                    name="email"
                    required
                    [disabled]="isLoading() || success()"
                  />
                </div>

                <div class="mb-3">
                  <label for="phone" class="form-label">{{ 'auth.register.phoneLabel' | translate }}</label>
                  <input
                    type="tel"
                    id="phone"
                    class="form-control"
                    [placeholder]="'auth.register.phonePlaceholder' | translate"
                    [ngModel]="phone()"
                    (ngModelChange)="phone.set($event)"
                    name="phone"
                    [disabled]="isLoading() || success()"
                  />
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">{{ 'auth.register.passwordLabel' | translate }}</label>
                  <input
                    type="password"
                    id="password"
                    class="form-control"
                    [placeholder]="'auth.register.passwordPlaceholder' | translate"
                    [ngModel]="password()"
                    (ngModelChange)="password.set($event)"
                    name="password"
                    required
                    minlength="8"
                    [disabled]="isLoading() || success()"
                  />
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 mb-3"
                  [disabled]="isLoading() || !name() || !email() || !password()"
                >
                  @if (isLoading()) {
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    {{ 'auth.register.creatingAccount' | translate }}
                  } @else {
                    {{ 'auth.register.registerButton' | translate }}
                  }
                </button>

                <div class="d-grid gap-2 my-3">
                  <button type="button" class="btn btn-outline-danger" (click)="onGoogleRegister()">
                    <i class="bi bi-google me-2"></i>
                    {{ 'auth.register.signUpWithGoogle' | translate }}
                  </button>
                </div>

                <hr class="my-3" />

                <div class="text-center">
                  <p class="mb-2 text-muted">{{ 'auth.register.hasAccount' | translate }}</p>
                  <a routerLink="/auth/login" class="btn btn-outline-secondary w-100"> {{ 'auth.register.loginButton' | translate }} </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class RegisterComponent {
  private readonly authFacade = inject(AuthFacadeService);
  private readonly translate = inject(TranslateService);

  readonly name = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly password = signal('');
  readonly error = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly success = signal(false);

  onRegister(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.authFacade
      .register$({
        name: this.name(),
        email: this.email(),
        password: this.password(),
        phone: this.phone() || undefined,
      })
      .subscribe({
        next: (result) => {
          if (!result.success) {
            this.isLoading.set(false);
            this.error.set(result.error?.message || this.translate.instant('auth.register.errors.registrationFailed'));
            return;
          }
          this.isLoading.set(false);
          this.success.set(true);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set(err.message || this.translate.instant('auth.register.errors.registrationFailed'));
        },
      });
  }

  onGoogleRegister(): void {
    window.location.href = this.authFacade.initiateGoogleOAuth();
  }
}
