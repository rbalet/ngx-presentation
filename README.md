# ngx-presentation

A scrolling presentation for **Why are we still rebuilding the same forms?**

TanStack Start, React, TypeScript and Motion. Chapter content will be developed one topic at a time.

## Local development

Use Node.js 24 and npm 11.19.0.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4310. The port is fixed so an occupied port produces an error rather than opening a different project.

## Checks

```sh
npm run build
npm run typecheck
npx playwright install chromium
npm test
```

Install the browser once. Tests cover chapter navigation, skipping extras, direct links, reduced motion, the introduction's card layout, navigation through the problem chapter and mobile overflow. Playwright starts the development server when needed.

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
