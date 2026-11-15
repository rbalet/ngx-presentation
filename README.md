# ngx-presentation

A scrolling presentation for **Why are we still rebuilding the same forms?**

Angular 22 with standalone components and zoneless signals, ngx-translate 18, and ngx-formly 11. English is the default; the header language selector switches to German or French and remembers the choice. All three catalogues are bundled, so language changes work without network requests.

## Local development

Use Node.js 24.15 or newer within the 24.x release line and [pnpm 12.18.0](https://pnpm.io/installation).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by [Portless](https://github.com/vercel-labs/portless), normally https://ngx-presentation.localhost. Portless assigns Angular a free port and keeps the browser URL stable. Linked git worktrees get their own subdomain.

The first run sets up a local HTTPS certificate and may ask for `sudo`. To use plain HTTP without certificate setup on macOS, run `pnpm exec portless proxy start --unprivileged` before `pnpm dev`; the URL will be http://ngx-presentation.localhost.

To run Angular directly, use `PORTLESS=0 pnpm dev` and open the URL Angular prints.

## Checks

```sh
pnpm build
pnpm typecheck
pnpm check:i18n
pnpm exec playwright install chromium
pnpm test
```

Install the browser once. Playwright covers desktop and mobile chapter navigation, the timer, themes, direct links, reduced motion, solution cards, language switching and persistence, and layout overflow. It starts Angular directly at http://127.0.0.1:4310. `check:i18n` uses the official ngx-translate skill's checker to compare keys, value types and interpolation parameters against English.

Angular’s optional OXC WASM fallback currently reports upstream `@emnapi` peer-version warnings during dependency resolution. The native macOS build and browser tests pass; the WASM fallback has not been exercised.

The production build is a static application in `dist/ngx-presentation/browser`. Hosting is not configured. A host must serve `index.html` for application paths to display the Angular not-found page.

## Editing chapters

- `src/chapters.ts` contains stable chapter numbers, translation keys, and timings.
- `src/presentation.ts` and its template contain the cover, index, timer and responsive slide layout.
- `src/components/chapter-section.ts` renders numbered sections and continuation slides.
- `src/components/chapter-title.ts` renders the shared heading and optional subtitle.
- `src/components/about-chapter.ts` contains chapter 01 and its dated metric sources.
- `src/components/problem-chapter.ts` contains the illustrative forms; `problem-requirements.ts` contains the interactive solutions.
- `src/i18n/{en,de,fr}.json` contains visible copy and accessibility labels. Update all three catalogues together.
- `src/languages.ts` loads the bundled catalogues, validates saved language choices, and synchronizes document language and metadata.
- `src/styles.css` contains presentation styles and native animations, including reduced-motion fallbacks.
- `HANDOFF.md` records the agreed content and the next work.

The title page is unnumbered. Chapter 09 is an optional extra. Chapter 10 was removed; remaining numbers stay stable. Chapter 08 has a **Skip extras** link to chapter 11. Chapter 12 contains future plans. Normal scrolling and browser anchor links remain available.

## Formly

`src/app.config.ts` registers `provideFormlyCore()` once at the application root, and `@angular/forms` is installed. No UI adapter or live form has been chosen yet; the chapter 02 examples remain illustrations. When building the first live form, use `FormGroup` and `ReactiveFormsModule` with `FormlyForm`, then register the chosen UI adapter or custom field types. Formly uses Angular Reactive Forms.

## Repository skills

The latest upstream skills were installed on 15 November 2026 in `.agents/skills` and used for this migration. They are available to agents on the next turn:

- [Angular developer](.agents/skills/angular-developer/SKILL.md), from [angular/skills](https://github.com/angular/skills/tree/main/angular-developer).
- [ngx-translate](.agents/skills/ngx-translate/SKILL.md), from [ngx-translate/core](https://github.com/ngx-translate/core/tree/develop/skills/ngx-translate), including its catalogue checker.
- [ngx-formly](.agents/skills/ngx-formly/SKILL.md), from [ngx-formly/ngx-formly](https://github.com/ngx-formly/ngx-formly/tree/main/skills/ngx-formly).

## Assets

The Formly logo in `public/formly.svg` comes from the ngx-formly repository. The npm and Stack Overflow logos in `public/metrics/` come from [Simple Icons](https://github.com/simple-icons/simple-icons). Background graphs are local SVG snapshots of public npm and Stack Exchange data. Their sources and date ranges are recorded in `HANDOFF.md` and in each SVG.
