import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequestDto, RegisterRequestDto } from '@domains/auth/dto';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthFacadeService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly currentUser = this.authService.currentUser;

  login$(credentials: LoginRequestDto): Observable<boolean> {
    return this.authService.login(credentials).pipe(
      tap(() => {
        this.router.navigate(['/home'], { replaceUrl: true });
      }),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  register$(
    userData: RegisterRequestDto,
  ): Observable<{ success: boolean; error?: { message: string } }> {
    return this.authService.register(userData).pipe(
      tap(() => {
        // Navigate to verify email page with email parameter
        this.router.navigate(['/auth/verify-email'], {
          queryParams: { email: userData.email },
          replaceUrl: true,
        });
      }),
      map(() => ({ success: true })),
      catchError((err) => of({ success: false, error: err })),
    );
  }

  requestOtp$(email: string): Observable<boolean> {
    return this.authService.requestEmailOtp(email).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  loginWithOtp$(email: string, otp: string): Observable<boolean> {
    return this.authService.loginWithOtp(email, otp).pipe(
      tap(() => {
        this.router.navigate(['/home']);
      }),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  loginWithGoogle$(code: string): Observable<boolean> {
    return this.authService.loginWithGoogle(code).pipe(
      tap(() => {
        this.router.navigate(['/home']);
      }),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  initiateGoogleOAuth(): string {
    return this.authService.initiateGoogleOAuth();
  }

  logout(): void {
    this.authService.logout();
  }

  verifyEmail$(token: string): Observable<boolean> {
    return this.authService.verifyEmail(token).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  verifyEmailAndLogin$(token: string): Observable<boolean> {
    return this.authService.verifyEmailAndLogin(token).pipe(
      tap(() => {
        this.router.navigate(['/home'], { replaceUrl: true });
      }),
      map(() => true),
      catchError(() => of(false)),
    );
  }
}
