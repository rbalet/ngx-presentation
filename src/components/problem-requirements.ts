import { Component, computed, DestroyRef, ElementRef, inject, model, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { contributors, coreTeam } from './formly-contributors';
import { problems } from './problems';

@Component({
  selector: 'app-problem-requirements',
  imports: [NgTemplateOutlet, TranslatePipe],
  templateUrl: './problem-requirements.html',
  styles: ':host { display: contents; }',
})
export class ProblemRequirements {
  readonly active = model<number | null>(null);
  readonly problems = problems;
  readonly coreTeam = coreTeam;
  readonly contributors = contributors;
  readonly portraitSize = `1200% ${Math.ceil((coreTeam.length + contributors.length) / 12) * 100}%`;
  readonly visited = signal<number[]>([]);
  readonly previous = computed(() => this.visited().filter(index => index < this.active()!));
  readonly next = computed(() => this.visited().filter(index => index > this.active()!));
  readonly pages = signal<{ index: number; outgoing: boolean; animate: boolean }[]>([]);
  readonly direction = signal(1);
  readonly result = viewChild.required<ElementRef<HTMLElement>>('result');
  private transitionTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.transitionTimer));
  }

  portraitPosition(index: number) {
    const rows = Math.ceil((coreTeam.length + contributors.length) / 12);
    return `${(index % 12) / 11 * 100}% ${Math.floor(index / 12) / (rows - 1) * 100}%`;
  }

  select(index: number, revisit = false) {
    if (index !== this.active()) {
      const previous = this.active();
      const animate = previous !== null && !matchMedia('(prefers-reduced-motion: reduce)').matches;
      clearTimeout(this.transitionTimer);
      this.direction.set(previous !== null && index < previous ? -1 : 1);
      this.visited.update(visited => visited.includes(index) ? visited : [...visited, index].sort((a, b) => a - b));
      this.active.set(index);
      this.pages.set([
        ...(animate ? [{ index: previous!, outgoing: true, animate: true }] : []),
        { index, outgoing: false, animate },
      ]);
      if (animate) {
        this.transitionTimer = setTimeout(() => this.pages.set([{ index, outgoing: false, animate: false }]), 380);
      }
    }
    if (revisit) this.result().nativeElement.focus({ preventScroll: true });
  }
}
