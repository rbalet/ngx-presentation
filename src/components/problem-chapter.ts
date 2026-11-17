import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';

const examples = [
  {
    title: 'problem.contact', design: 'problem.material', theme: 'material',
    challenge: 'problem.maintenance',
    icon: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-7 7a2.1 2.1 0 0 1-3-3l7-7a6 6 0 0 1 7.9-7.9z',
  },
  {
    title: 'problem.event', design: 'problem.custom', theme: 'custom',
    challenge: 'problem.complexity',
    icon: 'M12 7v5m-6 6v-3a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3M10 3h4v4h-4zM4 18h4v4H4zM16 18h4v4h-4z',
  },
  {
    title: 'problem.access', design: 'problem.bootstrap', theme: 'bootstrap',
    challenge: 'problem.integration',
    icon: 'm8 6-6 6 6 6m8-12 6 6-6 6m-2-15-4 18',
  },
];

@Component({
  selector: 'app-problem-chapter',
  imports: [NgTemplateOutlet, TranslatePipe, MatFormFieldModule, MatInputModule],
  templateUrl: './problem-chapter.html',
  styles: ':host { display: contents; }',
})
export class ProblemChapter {
  readonly part = input<'comparison' | 'ssf-forms' | 'challenges'>();
  readonly maintenanceResolved = input(false);
  readonly complexityResolved = input(false);
  readonly examples = computed(() => this.part() === 'comparison' ? examples.slice(0, 2)
    : this.part() === 'ssf-forms' ? examples.slice(2) : examples);
}
