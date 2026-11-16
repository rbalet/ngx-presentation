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

Install the browser once. Playwright covers desktop and mobile chapter navigation, presenter shortcuts, focus view, the timer, themes, direct links, reduced motion, the form demo, export, validation, Periscope walkthrough, language switching and persistence, and layout overflow. It starts Angular directly at http://127.0.0.1:4310. `check:i18n` uses the official ngx-translate skill's checker to compare keys, value types and interpolation parameters against English.

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
- `src/components/form-demo.*` and `src/demo/` contain the shared live Formly demo and serializable fixture.
- `src/components/periscope-chapter.*` and `closing-chapter.*` finish the product story and discussion.
- `PRESENTING.md` is the rehearsal checklist and speaker run of show.
- `HANDOFF.md` records the agreed content, sources and implementation status.

The title page is unnumbered. Chapter 09 is an optional extra. Chapter 10 was removed; remaining numbers stay stable. Chapter 08 has a **Skip extras** link to chapter 11. Chapter 12 contains future plans. Normal scrolling and browser anchor links remain available.

## Formly

`src/app.config.ts` registers Formly once with the demo's native input, select and textarea field types. Chapters 03–06 use Angular Reactive Forms and the same event-registration configuration. The chapter 02 examples remain illustrations.

The skill chapter provides a prompt for your coding agent to implement a form in `src/components/skill-result.ts`. Subsection 04.1 (`#chapter-04-result`) displays that result in the deck and starts with a placeholder. The browser does not call an AI service. The API exercise is a labeled simulation. Chapter 05 exports standard Formly JSON for the hosted [Formly Studio](https://builder.formly.dev/workspaces/forms) import flow. Running this deck does not require `@ngx-formly/builder` to be published on npm.

Periscope's interactive walkthrough is based on the existing project documentation. Start its separate frontend and API for the actual live demonstration. See [PRESENTING.md](PRESENTING.md) for the exact boundaries and fallback flow.

## Repository skills

The latest upstream skills were installed on 15 November 2026 in `.agents/skills` and used for this migration. They are available to agents on the next turn:

- [Angular developer](.agents/skills/angular-developer/SKILL.md), from [angular/skills](https://github.com/angular/skills/tree/main/angular-developer).
- [ngx-translate](.agents/skills/ngx-translate/SKILL.md), from [ngx-translate/core](https://github.com/ngx-translate/core/tree/develop/skills/ngx-translate), including its catalogue checker.
- [ngx-formly](.agents/skills/ngx-formly/SKILL.md), from [ngx-formly/ngx-formly](https://github.com/ngx-formly/ngx-formly/tree/main/skills/ngx-formly).

## Assets

The Formly logo in `public/formly.svg` comes from the ngx-formly repository. The npm and Stack Overflow logos in `public/metrics/` come from [Simple Icons](https://github.com/simple-icons/simple-icons). Background graphs are local SVG snapshots of public npm and Stack Exchange data. Their sources and date ranges are recorded in `HANDOFF.md` and in each SVG.
