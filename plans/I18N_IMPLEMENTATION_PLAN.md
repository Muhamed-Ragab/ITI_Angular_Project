# ITI Angular E‑Commerce — i18n Implementation Plan

**Project:** ITI Angular E‑Commerce Frontend  
**Framework:** Angular v21+ (Standalone Components)  
**Styling:** Bootstrap 5  
**State:** Angular Signals  
**Architecture:** Simplified DDD  
**Locales:** `en` (default), `ar` (RTL)

---

## 1) i18n Architecture

### 1.1 Recommended Library Strategy

**Primary choice:** `@ngx-translate/core` + `@ngx-translate/http-loader`  
**Why:** Runtime language switching (no rebuild), JSON-based dictionaries, great for SPA/standalone components.

**Alternative (documented):** Angular built-in i18n (`@angular/localize`) for compile-time translations. Use when you want build‑time translated bundles (less flexible for runtime switching).

### 1.2 Folder & Asset Structure

```
src/
├── assets/
│   └── i18n/
│       ├── en.json
│       └── ar.json
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   └── i18n.service.ts
│   │   └── interceptors/
│   ├── shared/
│   │   └── components/
│   │       └── language-switcher/
│   └── domains/
│       └── auth/
```

### 1.3 App Configuration (Standalone + Providers)

```ts
// app.config.ts
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslate } from './core/i18n/translate.provider';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideRouter(routes), provideTranslate()],
};
```

**Provider setup** (example):

```ts
// core/i18n/translate.provider.ts
import { importProvidersFrom } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export const provideTranslate = () =>
  importProvidersFrom(
    TranslateModule.forRoot({
      fallbackLang: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient],
      },
    }),
  );
```

---

## 2) Language Detection & Storage

### 2.1 Detection Priority

1. `?lang=` URL param (highest priority)
2. Local storage/cookie persisted preference
3. Browser language (`navigator.language`)
4. Default: `en`

### 2.2 Storage Strategy

- Use a **new `LanguageService`** or extend `StorageService` with `getLanguage()`/`setLanguage()`.
- Persist to **localStorage**, optionally mirror to cookie.

```ts
// core/services/i18n.service.ts
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly storage = inject(StorageService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  readonly currentLang = signal<'en' | 'ar'>('en');

  init(): void {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    const saved = this.storage.getItem<'en' | 'ar'>('lang');
    const browser = navigator.language.startsWith('ar') ? 'ar' : 'en';

    const lang = (fromUrl as 'en' | 'ar') ?? saved ?? browser ?? 'en';
    this.use(lang);
  }

  use(lang: 'en' | 'ar'): void {
    this.currentLang.set(lang);
    this.storage.setItem('lang', lang);
    this.translate.use(lang);
    this.setDocumentDir(lang);
    this.setDocumentLang(lang);
  }

  private setDocumentDir(lang: 'en' | 'ar') {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }

  private setDocumentLang(lang: 'en' | 'ar') {
    document.documentElement.setAttribute('lang', lang);
  }
}
```

---

## 3) Dynamic Language Switcher (No Reload)

### 3.1 Component Location

`src/app/shared/components/language-switcher/`

### 3.2 Example Component

```ts
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  template: `
    <button class="btn btn-outline-secondary" (click)="toggle()">
      {{ lang() === 'en' ? 'العربية' : 'English' }}
    </button>
  `,
})
export class LanguageSwitcherComponent {
  private readonly i18n = inject(I18nService);
  readonly lang = this.i18n.currentLang;

  toggle(): void {
    this.i18n.use(this.lang() === 'en' ? 'ar' : 'en');
  }
}
```

### 3.3 Integration Example

Add in header / main layout:

```html
<app-language-switcher></app-language-switcher>
```

---

## 4) RTL Support (Arabic)

### 4.1 Bootstrap RTL Strategy

- Include `bootstrap.rtl.min.css` for Arabic.
- Swap styles dynamically based on `dir`.

**Option A: Two Stylesheets**

```html
<link id="bootstrap-ltr" rel="stylesheet" href="/bootstrap.min.css" />
<link id="bootstrap-rtl" rel="stylesheet" href="/bootstrap.rtl.min.css" disabled />
```

```ts
if (lang === 'ar') {
  rtlLink.disabled = false;
  ltrLink.disabled = true;
}
```

**Option B: Build-time RTL bundle** (recommended for simplicity):

- Create `styles.rtl.css` and load via build config or dynamic injection.

### 4.2 Direction Toggle

The `I18nService` sets `<html dir="rtl">` for Arabic.

### 4.3 Custom CSS Mirroring

- Use logical properties: `margin-inline-start`, `padding-inline-end`, `text-align: start`.
- Avoid hardcoded `left/right` where possible.

---

## 5) Translation Management

### 5.1 Key Naming Convention

- **Domain-first** structure:

```
{
  "auth": { "login": { "title": "Login", "submit": "Sign In" } },
  "products": { "list": { "title": "Products" } },
  "errors": { "required": "This field is required" }
}
```

### 5.2 Component Usage

```html
<h1>{{ 'auth.login.title' | translate }}</h1>
<button>{{ 'auth.login.submit' | translate }}</button>
```

### 5.3 Services / Notifications

```ts
this.toast.success(this.translate.instant('orders.success'));
```

---

## 6) Localization Formatting

### 6.1 Angular Locale Data

Register locales in main:

```ts
import localeAr from '@angular/common/locales/ar';
registerLocaleData(localeAr, 'ar');
```

### 6.2 Pipes (Date, Currency, Number)

```html
{{ price | currency: (lang() === 'ar' ? 'EGP' : 'USD') }} {{ total | number:'1.2-2' }} {{ orderDate
| date:'mediumDate' }}
```

### 6.3 Pluralization

Use ICU or `@ngx-translate/messageformat-compiler`:

```json
"cart": {
  "items": "{count, plural, =0 {No items} =1 {1 item} other {# items}}"
}
```

```html
{{ 'cart.items' | translate:{ count: itemsCount } }}
```

---

## 7) Fallback Strategy

- Default language: **en**
- If key missing:
  - Log warning in dev
  - Fallback to key or default language

```ts
TranslateModule.forRoot({
  fallbackLang: 'en',
  missingTranslationHandler: {
    provide: MissingTranslationHandler,
    useClass: ConsoleMissingTranslationHandler,
  },
});
```

---

## 8) Testing Methodology

### 8.1 Visual Regression

- Capture LTR vs RTL screenshots (home, auth, checkout, profile, product detail).

### 8.2 Linguistic Review

- Manual QA by native Arabic speaker.
- Validate tone, terminology, and grammar.

### 8.3 RTL Layout Testing

- Check navbar alignment, cards, forms, tables, sliders.

### 8.4 Automated E2E

- Cypress/Playwright: toggle language, verify key UI strings.

---

## 9) Documentation & Maintenance

### 9.1 Adding New Strings

1. Add key to `en.json`
2. Add Arabic translation to `ar.json`
3. Use key in template/service

### 9.2 JSON Structure Rules

- Keep domain grouping
- Avoid duplication
- Prefer descriptive key names

### 9.3 Optional CI Check

- Script to detect missing keys between `en.json` and `ar.json`

---

## 10) Step‑by‑Step Implementation Guidance

1. **Install packages**
   ```bash
   npm i @ngx-translate/core @ngx-translate/http-loader
   ```
2. **Add assets/i18n** folder with `en.json`, `ar.json`
3. **Create `I18nService`** and register it in app bootstrap
4. **Add `LanguageSwitcherComponent`** to header
5. **Integrate RTL** (Bootstrap RTL + `dir` toggle)
6. **Replace hardcoded strings** with translation keys
7. **Add locale formatting** for date/number/currency
8. **Test** (LTR + RTL + QA reviews)
9. **Document process** in team docs

---

## 11) Library Comparison (Reference)

| Option           | Pros                                 | Cons                 | Best For                |
| ---------------- | ------------------------------------ | -------------------- | ----------------------- |
| `@ngx-translate` | Runtime switching, JSON, no rebuild  | Keys can get messy   | SPA + dynamic language  |
| Angular i18n     | Compiler checks, static translations | Rebuild per language | Multi-build deployments |

---

## 12) Success Criteria

- ✅ Language switch works without reload
- ✅ RTL layout is visually correct
- ✅ All UI strings are translatable
- ✅ Locale formatting works per language
- ✅ Missing translations handled gracefully

---

**Next Actions (after plan approval):** implement i18n services, translation assets, and update UI strings incrementally by domain.
