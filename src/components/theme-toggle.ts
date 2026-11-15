import { Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-theme-toggle',
  imports: [TranslatePipe],
  template: `
    <button type="button" class="theme-toggle"
      [attr.aria-label]="'theme.dark' | translate" [attr.aria-pressed]="dark()"
      [title]="(dark() ? 'theme.toLight' : 'theme.toDark') | translate" (click)="toggle()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        @if (dark()) {
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19" />
        } @else {
          <path d="M20.9 13.35A9 9 0 0 1 10.65 3.1 9 9 0 1 0 20.9 13.35Z" />
        }
      </svg>
    </button>
  `,
})
export class ThemeToggle {
  readonly dark = signal(document.documentElement.dataset['theme'] === 'dark');

  toggle() {
    this.dark.update(value => !value);
    const theme = this.dark() ? 'dark' : 'light';
    document.documentElement.dataset['theme'] = theme;
    try {
      localStorage.setItem('ngx-presentation-theme', theme);
    } catch {
      // Keep the selected theme for this visit when storage is unavailable.
    }
  }
}
