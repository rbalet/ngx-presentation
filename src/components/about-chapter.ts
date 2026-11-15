import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-about-chapter',
  imports: [TranslatePipe],
  templateUrl: './about-chapter.html',
  styles: ':host { display: contents; }',
})
export class AboutChapter {
  readonly part = input<'community' | 'maintainers'>();
}
