import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'h2[appChapterTitle]',
  imports: [TranslatePipe],
  template: `
    <span class="chapter-number">{{ number() }}</span>
    <span>{{ title() | translate }}
      @if (subtitle(); as text) {
        <p class="chapter-subtitle" [innerHTML]="text | translate"></p>
      }
    </span>
  `,
})
export class ChapterTitle {
  readonly number = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
