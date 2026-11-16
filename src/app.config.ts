import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { provideFormlyCore, withFormlyFieldExpression } from '@ngx-formly/core';
import { NotFound } from './app';
import { CatalogueLoader } from './languages';
import { Presentation } from './presentation';
import { demoFormlyConfig } from './demo/demo-field';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter([
      { path: '', component: Presentation },
      { path: '**', component: NotFound },
    ]),
    provideTranslateService({
      fallbackLang: 'en',
      lang: 'en',
      loader: provideTranslateLoader(CatalogueLoader),
    }),
    provideFormlyCore([demoFormlyConfig, withFormlyFieldExpression()]),
  ],
};
