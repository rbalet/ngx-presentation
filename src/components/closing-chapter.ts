import { afterRenderEffect, Component, ElementRef, input, signal, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  selector: 'app-closing-chapter',
  styleUrl: './closing-chapter.css',
  templateUrl: './closing-chapter.html',
})
export class ClosingChapter {
  readonly chapter = input.required<string>();
  protected readonly ellipsisVisible = signal(false);
  private readonly ellipsis = viewChild<ElementRef<SVGSVGElement>>('ellipsis');

  constructor() {
    afterRenderEffect(onCleanup => {
      const ellipsis = this.ellipsis()?.nativeElement;
      if (!ellipsis) return;

      const observer = new IntersectionObserver(([entry]) => {
        this.ellipsisVisible.set(entry.isIntersecting);
      });
      observer.observe(ellipsis);
      onCleanup(() => observer.disconnect());
    });
  }
}
