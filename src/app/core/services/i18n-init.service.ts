import { Injectable, inject } from '@angular/core';
import { I18nService } from './i18n.service';

@Injectable({ providedIn: 'root' })
export class I18nInitService {
  private readonly i18n = inject(I18nService);

  init(): void {
    this.i18n.init();
  }
}
