import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFacadeService } from '../../services/auth-facade.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <h2 class="card-title text-center mb-4">Create Account</h2>

              @if (error()) {
                <div class="alert alert-danger" role="alert">
                  {{ error() }}
                </div>
              }

              @if (success()) {
                <div class="alert alert-success" role="alert">
                  Registration successful! Please check your email to verify your account.
                </div>
              }

              <form (ngSubmit)="onRegister()">
                <div class="mb-3">
                  <label for="name" class="form-label">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    class="form-control"
                    placeholder="Enter your name"
                    [ngModel]="name()"
                    (ngModelChange)="name.set($event)"
                    name="name"
                    required
                    [disabled]="isLoading() || success()"
                  />
                </div>

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
                    [disabled]="isLoading() || success()"
                  />
                </div>

                <div class="mb-3">
                  <label for="phone" class="form-label">Phone (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    class="form-control"
                    placeholder="+1234567890"
                    [ngModel]="phone()"
                    (ngModelChange)="phone.set($event)"
                    name="phone"
                    [disabled]="isLoading() || success()"
                  />
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    class="form-control"
                    placeholder="Create a password"
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
                    Creating account...
                  } @else {
                    Register
                  }
                </button>

                <div class="d-grid gap-2 my-3">
                  <button type="button" class="btn btn-outline-danger" (click)="onGoogleRegister()">
                    <i class="bi bi-google me-2"></i>
                    Sign up with Google
                  </button>
                </div>

                <hr class="my-3" />

                <div class="text-center">
                  <p class="mb-2 text-muted">Already have an account?</p>
                  <a routerLink="/auth/login" class="btn btn-outline-secondary w-100"> Login </a>
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
            this.error.set(result.error?.message || 'Registration failed');
            return;
          }
          this.isLoading.set(false);
          this.success.set(true);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set(err.message || 'Registration failed');
        },
      });
  }

  onGoogleRegister(): void {
    window.location.href = this.authFacade.initiateGoogleOAuth();
  }
}
