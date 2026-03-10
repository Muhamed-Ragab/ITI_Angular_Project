import { Injectable, inject } from '@angular/core';
import { CookieService } from './cookie.service';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly cookieService = inject(CookieService);

  getItem<T>(key: string): T | null {
    const value = localStorage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

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
