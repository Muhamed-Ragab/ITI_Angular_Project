import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CookieService {
  private readonly tokenCookieName = 'iti_ecom_auth_token';
  private readonly expiresInSeconds = 86400; // 24 hours

  setCookie(token: string): void {
    try {
      const expires = new Date();
      expires.setSeconds(expires.getSeconds() + this.expiresInSeconds);
      // Remove Secure flag for development (localhost without HTTPS)
      const secureFlag = location.protocol === 'https:' ? ';Secure' : '';
      const cookieString = `${this.tokenCookieName}=${token};expires=${expires.toUTCString()};path=/;SameSite=Strict${secureFlag}`;
      console.log('[CookieService] Setting cookie:', cookieString.substring(0, 100) + '...');
      document.cookie = cookieString;

      // Verify cookie was set
      const cookieSet = this.getCookie();
      if (!cookieSet) {
        console.error('[CookieService] Failed to set auth cookie');
      } else {
        console.log('[CookieService] Cookie set successfully, length:', cookieSet.length);
      }
    } catch (error) {
      console.error('[CookieService] Error setting cookie:', error);
    }
  }

  getCookie(): string | null {
    try {
      const name = `${this.tokenCookieName}=`;
      const decodedCookie = decodeURIComponent(document.cookie);
      const ca = decodedCookie.split(';');
      for (let c of ca) {
        c = c.trim();
        if (c.indexOf(name) === 0) {
          return c.substring(name.length);
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cookie:', error);
      return null;
    }
  }

  removeCookie(): void {
    document.cookie = `${this.tokenCookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
}
