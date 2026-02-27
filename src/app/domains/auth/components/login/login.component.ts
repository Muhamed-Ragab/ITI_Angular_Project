import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthFacadeService } from '../../services/auth-facade.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <h2 class="card-title text-center mb-4">Login</h2>

              @if (verified()) {
                <div class="alert alert-success" role="alert">
                  <i class="bi bi-check-circle me-2"></i>
                  Email verified successfully! Please login.
                </div>
              }

              @if (error()) {
                <div class="alert alert-danger" role="alert">
                  {{ error() }}
                </div>
              }

              <form (ngSubmit)="onLogin()">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    class="form-control"
                    placeholder="Enter your email"
                    [ngModel]="email()"
                    (ngModelChange)="email.set($event)"
                    name="email"
                    required
                    [disabled]="isLoading()"
                  />
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    class="form-control"
                    placeholder="Enter your password"
                    [ngModel]="password()"
                    (ngModelChange)="password.set($event)"
                    name="password"
                    required
                    [disabled]="isLoading()"
                  />
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 mb-3"
                  [disabled]="isLoading() || !email() || !password()"
                >
                  @if (isLoading()) {
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Logging in...
                  } @else {
                    Login
                  }
                </button>

                <div class="text-center">
                  <a routerLink="/auth/otp-login" class="link-primary">Login with OTP</a>
                </div>

                <div class="d-grid gap-2 my-3">
                  <button type="button" class="btn btn-outline-danger" (click)="onGoogleLogin()">
                    <i class="bi bi-google me-2"></i>
                    Continue with Google
                  </button>
                </div>

                <hr class="my-3" />

                <div class="text-center">
                  <p class="mb-2 text-muted">Don't have an account?</p>
                  <a routerLink="/auth/register" class="btn btn-outline-secondary w-100">
                    Register
                  </a>
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
export class LoginComponent {
  private readonly authFacade = inject(AuthFacadeService);
  private readonly route = inject(ActivatedRoute);

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
            this.error.set('Invalid email or password');
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set(err.message || 'Login failed');
        },
      });
  }

  onGoogleLogin(): void {
    window.location.href = this.authFacade.initiateGoogleOAuth();
  }
}
