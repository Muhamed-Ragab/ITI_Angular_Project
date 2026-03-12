import { HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { CartService } from './cart.service';
import { GuestSyncService } from './guest-sync.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  private readonly guestSyncService = inject(GuestSyncService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isLoading = signal(true);

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    // Log for debugging
    console.log('[AuthService] Initializing, checking for token in URL...');
    
    // First, check if token is in URL query parameters (Google OAuth redirect)
    const tokenFromUrl = this.extractTokenFromUrl();
    
    console.log('[AuthService] Token from URL:', tokenFromUrl ? 'FOUND' : 'NOT FOUND');
    console.log('[AuthService] Current URL:', window.location.href);
    
    if (tokenFromUrl) {
      // Store token in cookies and clear from URL
      console.log('[AuthService] Storing token from URL...');
      this.storage.setToken(tokenFromUrl);
      this.clearTokenFromUrl();
      
      // Fetch user profile with the token
      this.fetchUserProfile().subscribe({
        next: (profile) => {
          console.log('[AuthService] Profile fetched successfully:', profile);
          this.isLoading.set(false);
          this.guestSyncService.syncGuestData().subscribe();
          // Navigate to home with clean URL
          this.router.navigate(['/home'], { replaceUrl: true });
        },
        error: (err) => {
          console.error('[AuthService] Failed to fetch profile:', err);
          this.storage.removeToken();
          this.currentUser.set(null);
          this.isLoading.set(false);
        },
      });
      return;
    }

    // Otherwise, check token in storage (cookies)
    const token = this.storage.getToken();
    console.log('[AuthService] Token from cookies:', token ? 'FOUND' : 'NOT FOUND');
    
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

  /**
   * Extract token from URL query parameters (for Google OAuth redirect)
   * Checks multiple sources to handle timing issues with router
   */
  private extractTokenFromUrl(): string | null {
    try {
      // Method 1: Try snapshot first (works if router has processed URL)
      let token = this.route.snapshot.queryParamMap.get('token');
      console.log('[AuthService] Route snapshot token:', token ? 'FOUND' : 'NOT FOUND');
      
      if (token) return token;
      
      // Method 2: Check window.location directly (more reliable for OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get('token');
      console.log('[AuthService] Window URL token check:', token ? 'FOUND' : 'NOT FOUND');
      
      if (token) return token;
      
      // Method 3: Check hash fragment (some OAuth providers use this)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      token = hashParams.get('token');
      console.log('[AuthService] Hash token check:', token ? 'FOUND' : 'NOT FOUND');
      
      return token;
    } catch (e) {
      console.error('[AuthService] Error extracting token:', e);
      return null;
    }
  }

  /**
   * Clear token from URL by navigating to same route without query params
   */
  private clearTokenFromUrl(): void {
    try {
      this.router.navigate([], {
        queryParams: {},
        queryParamsHandling: '',
        replaceUrl: true,
      });
    } catch {
      // Ignore navigation errors
    }
  }

  /**
   * Fetch user profile from API - made public for external use
   */
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
          // Sync guest cart to server and fetch user's server cart
          this.guestSyncService.syncGuestData().subscribe();
          this.cartService.getCart().subscribe();
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
          // Sync guest cart to server and fetch user's server cart
          this.guestSyncService.syncGuestData().subscribe();
          this.cartService.getCart().subscribe();
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
          // Sync guest cart to server and fetch user's server cart
          this.guestSyncService.syncGuestData().subscribe();
          this.cartService.getCart().subscribe();
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
