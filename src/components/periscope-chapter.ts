import { Component, computed, signal } from '@angular/core';
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
  readonly hoveredCapability = signal<number | null>(null);
  readonly focusedCapability = signal<number | null>(null);
  readonly activeCapability = computed(() => this.hoveredCapability() ?? this.focusedCapability());

  // Coordinates are relative to each original image, including the wider survey illustration.
  readonly regions = {
    events: [
      // Event setup: the planning board and stage.
      'M.055 .215 L.385 .012 L.408 .375 L.09 .568 Z M.535 .005 L.91 .105 L.94 .365 L.835 .562 L.46 .398 L.46 .326 L.535 .24 Z',
      // Participants: individual badges and the delegation seating.
      'M.025 .575 L.185 .57 L.355 .77 L.255 .93 L.025 .805 Z M.51 .7 L.63 .69 L.795 .8 L.78 .965 L.51 .9 Z M.94 .68 L1 .66 L1 .885 L.87 .985 L.79 .95 L.87 .82 Z',
      // Registration details: the document folder and notes.
      'M.645 .63 L.785 .525 L.92 .625 L.92 .705 L.84 .785 L.64 .69 Z M.285 .81 L.475 .77 L.49 .84 L.4 .95 L.285 .9 Z',
    ],
    workflows: [
      // Form steps: start, participant, and configuration.
      'M.135 .225 L.5 .225 L.5 .365 L.135 .365 Z',
      // Status: the decision and its approval branches.
      'M.535 .175 L.87 .165 L.875 .52 L.61 .52 L.61 .46 L.47 .46 L.46 .515 L.38 .515 L.38 .59 L.205 .59 L.205 .44 L.38 .44 L.38 .49 L.445 .49 L.45 .43 L.56 .425 L.56 .34 L.535 .32 Z',
      // Reuse: shared controls and automated actions.
      'M.105 .755 L.29 .755 L.29 .93 L.105 .93 Z M.445 .58 L.895 .58 L.895 .73 L.445 .73 Z M.65 .755 L.88 .755 L.88 .93 L.65 .93 Z',
    ],
    surveys: [
      // Question types: the questionnaire on the clipboard.
      'M.36 .15 L.655 .10 L.715 .705 L.425 .825 Z',
      // Follow-up questions: respondent cards and the conversation bubble.
      'M.13 .125 L.36 .075 L.365 .515 L.13 .57 Z M.23 .59 L.345 .58 L.345 .74 L.26 .78 L.23 .75 Z',
      // Responses: the result charts.
      'M.695 .12 L.89 .13 L.895 .625 L.695 .585 Z M.65 .625 L.77 .615 L.775 .855 L.65 .88 Z M.775 .665 L.905 .665 L.91 .825 L.775 .825 Z',
    ],
  };
}
