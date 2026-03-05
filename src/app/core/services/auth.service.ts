import { HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
  RegisterResponseDto,
  SuccessResponseDto,
} from '@domains/auth/dto';
import { User } from '@domains/auth/types';
import { environment } from '@env/environment';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { GuestSyncService } from './guest-sync.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  private readonly guestSyncService = inject(GuestSyncService);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isLoading = signal(true);

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = this.storage.getToken();
    if (token) {
      this.fetchUserProfile().subscribe({
        next: () => {
          this.isLoading.set(false);
          // Optional: also sync if token found?
          // Usually guest data only accumulates when NOT logged in.
          this.guestSyncService.syncGuestData().subscribe();
        },
        error: () => {
          this.storage.removeToken();
          this.currentUser.set(null);
          this.isLoading.set(false);
        },
      });
    } else {
      this.isLoading.set(false);
    }
  }

  private fetchUserProfile(): Observable<SuccessResponseDto<User>> {
    return this.api.get<SuccessResponseDto<User>>('/users/profile').pipe(
      tap((response) => {
        this.currentUser.set(response.data);
      }),
    );
  }

  login(credentials: LoginRequestDto): Observable<AuthResponseDto> {
    return this.api.post<AuthResponseDto>('/auth/login', credentials).pipe(
      tap((response) => {
        if (response?.data?.token) {
          this.storage.setToken(response.data.token);
          this.currentUser.set(response.data.user);
          this.guestSyncService.syncGuestData().subscribe();
        }
      }),
    );
  }

  register(userData: RegisterRequestDto): Observable<RegisterResponseDto> {
    return this.api.post<RegisterResponseDto>('/auth/register', userData);
  }

  logout(): void {
    this.api.post('/auth/logout', {}).subscribe({
      next: () => {
        this.storage.removeToken();
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.storage.removeToken();
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
      },
    });
  }

  requestEmailOtp(email: string): Observable<SuccessResponseDto> {
    return this.api.post<SuccessResponseDto>('/auth/email/request-otp', { email });
  }

  loginWithOtp(email: string, otp: string): Observable<AuthResponseDto> {
    return this.api.post<AuthResponseDto>('/auth/email/login', { email, otp }).pipe(
      tap((response) => {
        if (response?.data?.token) {
          this.storage.setToken(response.data.token);
          this.currentUser.set(response.data.user);
          this.guestSyncService.syncGuestData().subscribe();
        }
      }),
    );
  }

  loginWithGoogle(code: string): Observable<AuthResponseDto> {
    return this.api.post<AuthResponseDto>('/auth/google/callback', { code }).pipe(
      tap((response) => {
        if (response?.data?.token) {
          this.storage.setToken(response.data.token);
          this.currentUser.set(response.data.user);
          this.guestSyncService.syncGuestData().subscribe();
        }
      }),
    );
  }

  initiateGoogleOAuth(): string {
    return `${environment.apiUrl}/auth/google`;
  }

  verifyEmail(token: string): Observable<SuccessResponseDto> {
    return this.api.get<SuccessResponseDto>(
      `/auth/verify-email`,
      new HttpParams().set('token', token),
    );
  }

  verifyEmailAndLogin(token: string): Observable<SuccessResponseDto> {
    // Call the GET verify endpoint, then automatically login
    return this.api
      .get<SuccessResponseDto>(`/auth/verify-email`, new HttpParams().set('token', token))
      .pipe(
        tap(() => {
          // Email verified successfully
        }),
      );
  }
}
