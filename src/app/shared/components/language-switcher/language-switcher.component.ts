import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '@core/services/i18n.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="dropdown">
      <a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown">
        {{ 'common.language' | translate }}
      </a>

      <ul class="dropdown-menu">
        <li>
          <button class="dropdown-item" type="button" (click)="setLang('en')">
            {{ 'common.english' | translate }}
          </button>
        </li>
        <li>
          <button class="dropdown-item" type="button" (click)="setLang('ar')">
            {{ 'common.arabic' | translate }}
          </button>
        </li>
      </ul>
    </div>
  `,
})
export class LanguageSwitcherComponent {
  private readonly i18n = inject(I18nService);

  setLang(lang: 'en' | 'ar'): void {
    this.i18n.use(lang);
  }
}
