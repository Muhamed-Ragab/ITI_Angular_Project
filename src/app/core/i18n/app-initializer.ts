import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { I18nInitService } from '../services/i18n-init.service';

export const provideI18nInitializer = (): EnvironmentProviders =>
  provideAppInitializer(() => inject(I18nInitService).init());
