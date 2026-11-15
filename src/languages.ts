import { DOCUMENT, effect, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateLoader, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import en from './i18n/en.json';
import fr from './i18n/fr.json';
import de from './i18n/de.json';

const catalogues = { en, fr, de };
const storageKey = 'ngx-presentation-language';
export type Language = keyof typeof catalogues;

@Injectable()
export class CatalogueLoader extends TranslateLoader {
  getTranslation(language: string) {
    return of(catalogues[language as Language] ?? en);
  }
}

@Injectable({ providedIn: 'root' })
export class Languages {
  readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  constructor() {
    this.translate.addLangs(['en', 'fr', 'de']);
    let language = 'en';
    try {
      language = localStorage.getItem(storageKey) ?? 'en';
    } catch {
      // English remains the default when storage is unavailable.
    }
    this.select(language);
    effect(() => {
      const language = this.translate.currentLang();
      this.document.documentElement.lang = language ?? 'en';
      // The bundled loader is synchronous, so catalogues are ready here.
      this.title.setTitle(`${this.translate.instant('app.title')} | ngx-formly`);
      this.meta.updateTag({ name: 'description', content: this.translate.instant('app.description') });
    });
  }

  select(value: string) {
    const language: Language = value === 'de' || value === 'fr' ? value : 'en';
    this.translate.use(language).subscribe();
    try {
      localStorage.setItem(storageKey, language);
    } catch {
      // Keep language switching available without storage.
    }
  }
}
