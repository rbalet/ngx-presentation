import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Languages } from './languages';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  private readonly languages = inject(Languages);
}

@Component({
  selector: 'app-not-found',
  imports: [TranslatePipe],
  template: `<main class="not-found"><h1>{{ 'app.notFound' | translate }}</h1><a href="./">{{ 'app.open' | translate }}</a></main>`,
})
export class NotFound {}
