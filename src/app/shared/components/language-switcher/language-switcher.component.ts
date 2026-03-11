import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '@core/services/i18n.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dropdown lang-switcher">
      <button
        class="lang-toggle btn w-100"
        type="button"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        [attr.aria-label]="'common.language' | translate"
      >
        <span class="lang-flag">{{ i18n.currentLang() === 'ar' ? '🇸🇦' : '🇺🇸' }}</span>
        <span class="lang-label">
          {{ i18n.currentLang() === 'ar' ? 'العربية' : 'English' }}
        </span>
        <i class="bi bi-chevron-down lang-chevron ms-auto"></i>
      </button>

      <ul class="dropdown-menu lang-menu shadow-lg border-0 py-1">
        <li>
          <button
            class="dropdown-item lang-option"
            [class.lang-active]="i18n.currentLang() === 'en'"
            type="button"
            (click)="setLang('en')"
          >
            <span class="lang-option-flag">🇺🇸</span>
            <span class="lang-option-text">{{ 'common.english' | translate }}</span>
            @if (i18n.currentLang() === 'en') {
              <i class="bi bi-check2 lang-check ms-auto"></i>
            }
          </button>
        </li>
        <li>
          <button
            class="dropdown-item lang-option"
            [class.lang-active]="i18n.currentLang() === 'ar'"
            type="button"
            (click)="setLang('ar')"
          >
            <span class="lang-option-flag">🇸🇦</span>
            <span class="lang-option-text">{{ 'common.arabic' | translate }}</span>
            @if (i18n.currentLang() === 'ar') {
              <i class="bi bi-check2 lang-check ms-auto"></i>
            }
          </button>
        </li>
      </ul>
    </div>
  `,
  styles: [
    `
      .lang-switcher {
        width: 100%;
      }

      .lang-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 0.875rem;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.875rem;
        transition: all 0.2s ease;
      }

      .lang-toggle:hover {
        background: rgba(255, 255, 255, 0.14);
        color: #fff;
        border-color: rgba(255, 255, 255, 0.2);
      }

      .lang-toggle::after {
        display: none;
      }

      .lang-flag {
        font-size: 1.1rem;
        line-height: 1;
      }

      .lang-label {
        flex: 1;
        text-align: start;
        font-weight: 500;
        letter-spacing: 0.01em;
      }

      .lang-chevron {
        font-size: 0.65rem;
        opacity: 0.6;
        transition: transform 0.2s ease;
      }

      .dropdown.show .lang-chevron {
        transform: rotate(180deg);
      }

      .lang-menu {
        min-width: 160px;
        background: #1e2b3a;
        border-radius: 10px;
        overflow: hidden;
        margin-top: 4px !important;
      }

      .lang-option {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.625rem 1rem;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.875rem;
        transition: all 0.15s ease;
      }

      .lang-option:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }

      .lang-option.lang-active {
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
      }

      .lang-option-flag {
        font-size: 1rem;
        line-height: 1;
      }

      .lang-option-text {
        flex: 1;
      }

      .lang-check {
        font-size: 0.9rem;
        color: #4ade80;
        font-weight: 700;
      }
    `,
  ],
})
export class LanguageSwitcherComponent {
  readonly i18n = inject(I18nService);

  setLang(lang: 'en' | 'ar'): void {
    this.i18n.use(lang);
  }
}
