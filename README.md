# ngx-presentation

A scrolling presentation for **Why are we still rebuilding the same forms?**

TanStack Start, React, TypeScript and Motion. Chapter content will be developed one topic at a time.

## Local development

Use Node.js 24 and [pnpm 12.18.0](https://pnpm.io/installation).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by [Portless](https://github.com/vercel-labs/portless), normally https://ngx-presentation.localhost. Portless assigns Vite a free port and keeps the browser URL stable. Linked git worktrees get their own subdomain.

The first run sets up a local HTTPS certificate and may ask for `sudo`. To use plain HTTP without certificate setup on macOS, run `pnpm exec portless proxy start --unprivileged` before `pnpm dev`; the URL will be http://ngx-presentation.localhost.

To run Vite directly, use `PORTLESS=0 pnpm dev` and open the URL Vite prints.

## Checks

```sh
pnpm build
pnpm typecheck
pnpm exec playwright install chromium
pnpm test
```

Install the browser once. Tests cover chapter navigation, skipping extras, direct links, reduced motion, the introduction's card layout, navigation through the problem chapter and mobile overflow. Playwright bypasses Portless and starts Vite at http://127.0.0.1:4310 when needed, with a strict port so it cannot silently switch to another port.

## Editing chapters

- `src/chapters.ts` contains stable chapter numbers, titles, summaries and timings.
- `src/components/chapter-section.tsx` renders the numbered sections and their Motion transitions.
- `src/components/chapter-title.tsx` renders the shared chapter heading and optional italic subtitle, including inline emphasis.
- `src/components/about-chapter.tsx` contains chapter 01 and its dated metric sources.
- `src/components/problem-chapter.tsx` contains chapter 02: the project-switching story, illustrative forms and shared requirements.
- `src/routes/index.tsx` contains the cover and chapter index.
- `src/styles.css` contains the presentation styles and reduced-motion fallback.
- `HANDOFF.md` records the agreed content and the next work.

The title page is unnumbered. Chapters 09 and 10 are optional extras. Chapter 08 has a **Skip extras** link to chapter 11. Normal scrolling and browser anchor links remain available.

TanStack generates `src/routeTree.gen.ts`; do not edit it manually. Production hosting is not configured yet.

## References

- [TanStack Start setup](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch)
- [Motion scroll animation](https://motion.dev/docs/react-scroll-animations)
- [Motion accessibility](https://motion.dev/docs/react-accessibility)

The Formly logo in `public/formly.svg` comes from the ngx-formly repository.

The npm and Stack Overflow logos in `public/metrics/` come from [Simple Icons](https://github.com/simple-icons/simple-icons). Background graphs are local SVG snapshots of public npm and Stack Exchange data. Their sources and date ranges are recorded in `HANDOFF.md` and in each SVG.
