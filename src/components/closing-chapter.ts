import { Component, inject, input, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Languages } from '../languages';

@Component({
  imports: [JsonPipe, TranslatePipe],
  selector: 'app-closing-chapter',
  styleUrl: './closing-chapter.css',
  templateUrl: './closing-chapter.html',
})
export class ClosingChapter {
  readonly chapter = input.required<string>();
  readonly languages = inject(Languages);
  readonly name = signal('Alex Example');
}
