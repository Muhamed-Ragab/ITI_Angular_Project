import { HttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslationObject } from '@ngx-translate/core';
import { Observable } from 'rxjs';

class JsonTranslateLoader implements TranslateLoader {
  constructor(private readonly http: HttpClient) {}

  getTranslation(lang: string): Observable<TranslationObject> {
    return this.http.get<TranslationObject>(`assets/i18n/${lang}.json`);
  }
}

export function httpTranslateLoader(http: HttpClient) {
  return new JsonTranslateLoader(http);
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
