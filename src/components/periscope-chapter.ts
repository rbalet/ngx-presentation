import { Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  selector: 'app-periscope-chapter',
  styleUrl: './periscope-chapter.css',
  templateUrl: './periscope-chapter.html',
})
export class PeriscopeChapter {
  readonly areas = ['events', 'workflows', 'surveys'] as const;
  readonly area = signal<(typeof this.areas)[number]>('events');
}
