import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  selector: 'app-skill-result',
  styleUrl: './form-demo.css',
  template: `
    <h3>{{ 'demo.skill.resultTitle' | translate }}</h3>
    <p class="demo-lead">{{ 'demo.skill.resultEmpty' | translate }}</p>
  `,
})
export class SkillResult {}
