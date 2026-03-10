import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from './storage.service';

export type SupportedLanguage = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly storage = inject(StorageService);
  private readonly translate = inject(TranslateService);

  readonly currentLang = signal<SupportedLanguage>('en');

  init(): void {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    const saved = this.storage.getItem<SupportedLanguage>('lang');
    const browser = navigator.language.startsWith('ar') ? 'ar' : 'en';

    const lang = (fromUrl as SupportedLanguage) ?? saved ?? browser ?? 'en';
    this.use(lang);
  }

  use(lang: SupportedLanguage): void {
    this.currentLang.set(lang);
    this.storage.setItem('lang', lang);
    this.translate.use(lang);
    this.setDocumentDir(lang);
    this.setDocumentLang(lang);
    this.toggleBootstrapRtl(lang);
  }

  private setDocumentDir(lang: SupportedLanguage): void {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }

  private setDocumentLang(lang: SupportedLanguage): void {
    document.documentElement.setAttribute('lang', lang);
  }

  private toggleBootstrapRtl(lang: SupportedLanguage): void {
    const rtlLink = document.getElementById('bootstrap-rtl') as HTMLLinkElement | null;
    const ltrLink = document.getElementById('bootstrap-ltr') as HTMLLinkElement | null;

    if (!rtlLink || !ltrLink) return;

    if (lang === 'ar') {
      rtlLink.disabled = false;
      ltrLink.disabled = true;
    } else {
      rtlLink.disabled = true;
      ltrLink.disabled = false;
    }
  }
}
