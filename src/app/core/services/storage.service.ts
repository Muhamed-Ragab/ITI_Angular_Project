import { Injectable, inject } from '@angular/core';
import { CookieService } from './cookie.service';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly cookieService = inject(CookieService);

  getToken(): string | null {
    return this.cookieService.getCookie();
  }

  setToken(token: string): void {
    this.cookieService.setCookie(token);
  }

  removeToken(): void {
    this.cookieService.removeCookie();
  }

  clear(): void {
    this.cookieService.removeCookie();
  }
}
