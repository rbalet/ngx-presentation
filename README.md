# ngx-presentation

A scrolling presentation for **Why are we still rebuilding the same forms?**

Angular 22 with standalone components and zoneless signals, ngx-translate 18, and ngx-formly 11. English is the default; the header and chapter 03 live-form language selectors switch to German or French and remember the choice. All three catalogues are bundled, so language changes work without network requests.

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

Install the browser once. Playwright covers desktop and mobile chapter navigation, presenter shortcuts, focus view, the timer, themes, direct links, reduced motion, the form demo, export, validation, PeriScope walkthrough, language switching and persistence, and layout overflow. It starts Angular directly at http://127.0.0.1:4310. `check:i18n` uses the official ngx-translate skill's checker to compare keys, value types and interpolation parameters against English.

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

The title page is unnumbered. Chapters 08, 09 and 10 were removed; remaining numbers stay stable. Chapter 03 demonstrates language switching beside the live form. Chapter 07 leads to chapter 12 for future plans, then chapter 11 for Q&A. Normal scrolling and browser anchor links remain available.

## Formly

`src/app.config.ts` registers Formly once with the demo's native input, select and textarea field types. Chapters 03–05 share the same event-registration configuration. The chapter 02 examples remain illustrations.

Chapter 04 uses **Formly 11.3's built-in WebMCP**: the phone field opts in with `webMcp: true`, and `options.webMcp.name` keeps the tool named `fill_phone_number`. Other demo fields remain excluded and submission is not enabled. The former phone-only Angular adapter is no longer needed.

To try it locally, enable `chrome://flags/#enable-webmcp-testing` and relaunch Chrome ([Chrome setup guide](https://developer.chrome.com/docs/ai/webmcp)). Start the app, then open `/?selected=webmcp#chapter-04`. Use a compatible browser agent or run this in that page's DevTools console:

```js
const tools = await document.modelContext.getTools();
const phoneTool = tools.find(tool => tool.name === 'fill_phone_number');
await document.modelContext.executeTool(phoneTool, { phoneNumber: '+1 202-555-0147' });
```

The phone input updates and the result reports `valid: true`. Calling with `{}` inspects validation without changing values; an empty phone number reports `valid: false`. Formly's fill action returns `status: 'filled'` even when validation fails. Switching away from the WebMCP panel unregisters the tool. WebMCP remains an experimental browser API; without it, manual input still works.

The skill chapter provides a `/ngx-formly` prompt to add street, postal code, city and country inputs to the existing form, then leads directly to chapter 05, **API & validation**, to review, edit and validate the resulting Formly JSON. The browser does not call an AI service. The validator starts with the shared configuration from chapter 03. Chapter 06, **Make it yours**, embeds a small visual editor using the public `@ngx-formly/builder` headless engine. Add text, long-text or choice fields; edit labels and required flags; reorder or remove fields; try the live preview; download Formly JSON or open the hosted builder in a new tab. It starts from a snapshot of chapter 03 and resets to that chapter’s current configuration. Chapter 05’s untrusted JSON drafts are never executed by the builder. Edits stay in memory until reset or reload.

The dependency is a locally built `@ngx-formly/builder@0.0.1` tarball containing the headless-root changes, included under `vendor/`, so installation needs neither a sibling checkout nor npm publication. The package root exposes the engine; the ready-made editor lives at the optional `@ngx-formly/builder/ui` entry point. The demo uses the existing native Formly controls; no builder stylesheet or global UI providers are loaded. See [vendor/README.md](vendor/README.md) for provenance, bundle comparison, refresh commands and verification limits.

PeriScope's interactive walkthrough is based on the existing project documentation. Start its separate frontend and API for the actual live demonstration. See [PRESENTING.md](PRESENTING.md) for the exact boundaries and fallback flow.

## Repository skills

The latest upstream skills were installed on 15 November 2026 in `.agents/skills` and used for this migration. They are available to agents on the next turn:

- [Angular developer](.agents/skills/angular-developer/SKILL.md), from [angular/skills](https://github.com/angular/skills/tree/main/angular-developer).
- [ngx-translate](.agents/skills/ngx-translate/SKILL.md), from [ngx-translate/core](https://github.com/ngx-translate/core/tree/develop/skills/ngx-translate), including its catalogue checker.
- [ngx-formly](.agents/skills/ngx-formly/SKILL.md), from [ngx-formly/ngx-formly](https://github.com/ngx-formly/ngx-formly/tree/main/skills/ngx-formly).

## Assets

The Formly logo in `public/formly.svg` comes from the ngx-formly repository. The npm and Stack Overflow logos in `public/metrics/` come from [Simple Icons](https://github.com/simple-icons/simple-icons). Background graphs are local SVG snapshots of public npm and Stack Exchange data. Their sources and date ranges are recorded in `HANDOFF.md` and in each SVG.
