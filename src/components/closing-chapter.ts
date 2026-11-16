import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  selector: 'app-closing-chapter',
  styleUrl: './closing-chapter.css',
  templateUrl: './closing-chapter.html',
})
export class ClosingChapter {
  readonly chapter = input.required<string>();
}
