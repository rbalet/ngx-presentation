# Presentation handoff

## Goal

Present ngx-formly to BIT colleagues and management to gain support for a shared form approach. The talk defaults to English, with German and French available from the header and chapter 03 live-form language selectors. The full slot is 60 minutes, with up to 45 minutes of presentation and 15 minutes of Q&A.

Title: **Why are we still rebuilding the same forms?**

Subtitle: \*_Extensive form manipulation with ngx-formly, a unified approach._

The scrolling presentation uses Angular 22, ngx-translate 18 and ngx-formly 11. The full talk now has interactive chapters. See [PRESENTING.md](PRESENTING.md) for the rehearsal checklist, run of show, demo boundaries and offline fallbacks. The historical notes below retain the earlier content decisions and sources.

## Chapter numbers

| Chapter | Topic                                  | Minutes | Status                          |
| ------- | -------------------------------------- | ------- | ------------------------------- |
| 01      | About me                               | 2       | Main, first slide implemented   |
| 02      | Repeated form implementation           | 5       | Main, first content implemented |
| 03      | Introduction to ngx-formly             | 7       | Main                            |
| 04      | Agentic Workflow                       | 4       | Main, result reviewed in 05     |
| 05      | API & validation                       | 6       | Main, editing and Studio export |
| 06      | Make it yours                          | 4       | Reserved, content empty         |
| 07      | Periscope                              | 8       | Main                            |
| 12      | What's next                            | 3       | Main, future plans              |
| 11      | Q&A                                    | 15      | Discussion                      |

The main content totals 39 minutes. With 15 minutes of Q&A, six minutes remain as buffer. Chapter 03 includes the language demonstration; chapters 08, 09 and 10 were removed. Keep the remaining numbers stable when developing each chapter.

## Content decisions

- Treat MCP/WebMCP as implemented for the presentation, as the user requested. The scaffold does not implement an MCP server or WebMCP integration itself.
- Periscope is the user's event, workflow and survey tool. Chapter 07 pairs each area with three proposed Formly capabilities and the supplied product illustration. The illustrations are bundled locally; start Periscope's separate environment for a live product demo.
- Chapter 05 reuses Formly’s JSON validator and starts with chapter 03’s configuration. Chapter 06 is empty pending a headless component example.
- Keep translation optional. It supports the main presentation but must not displace it.
- Do not invent adoption statistics, time savings or Periscope implementation details.

## Current setup

- Repository: `/Users/raphael.balet/Documents/Open-source/ngx-presentation`.
- Run `pnpm dev` through Portless and open the printed URL (normally https://ngx-presentation.localhost). Playwright bypasses the proxy and uses port 4310.
- Chapter IDs are `chapter-01` through `chapter-07`, plus `chapter-11` for Q&A and `chapter-12` for What's next, and support direct hash links. Chapters 08, 09 and 10 were removed; the remaining numbers stay stable.
- Native CSS applies a small scroll-linked vertical transition where supported. Reduced-motion mode disables animations and smooth anchor scrolling.
- Navigation uses normal links; chapter 07 leads to What's next and then Q&A.
- ngx-translate loads bundled catalogues from `src/i18n/{en,de,fr}.json`; English is the default and fallback. Language changes update document metadata and accessibility labels and persist when storage is available.
- ngx-formly core is registered in `src/app.config.ts` with native demo field types and the CSP-safe expression evaluator. Chapters 03–05 share event-registration state.
- Official Angular, ngx-translate and ngx-formly skills live in `.agents/skills`. Run `pnpm check:i18n` after editing translations.
- No presentation hosting, authentication or backend is configured. Local interactive examples work offline; the real Studio handoff needs a connection.

## Chapter 01

Use "About me" as the title and "And my vanity metrics" as a smaller subtitle beneath it. Hide the duration on this slide; retain its two-minute allocation in the agenda.

The user requested a playful introduction inspired by simple three-card presentation slides. Keep Stack Overflow, ngx-translate and ngx-formly in that order, on one row on desktop. The two libraries share an **Open-source maintainer** container. The cards stack on small screens. Keep the scroll animation and reduced-motion support.

All three cards are neutral by default. Hovering a card turns its border and main metric the primary red; the highlight follows the pointer. Apply this only on devices that support hover to avoid a sticky highlight on touch screens.

Match the user's portfolio reference with a small source logo at the top right and a subtle graph behind the foreground content. Show exact npm counts, not abbreviated figures. Keep Fanatic as the Stack Overflow headline. The graph behind it shows public reputation gains, not visits or progress toward the badge.

Content lives in `src/components/about-chapter.ts`. The slide introduces Raphaël Balet as an Expert Developer at BIT. It uses the Fanatic badge as the joke and ends the Formly card with "The reason we're here."

Verified sources, checked 9 November 2026:

- [Raphaël's Stack Overflow profile](https://stackoverflow.com/users/11135174/rapha%C3%ABl-balet) lists the Fanatic gold badge, awarded 11 October 2022, and 202 answers at the time of checking.
- [Fanatic badge definition](https://stackoverflow.com/help/badges/83/fanatic) is visiting every day for 100 consecutive days. It does not establish a developer ranking or moderator role. The user mentioned having ranked highly historically, but the slide makes no unverified ranking claim.
- [npm, @ngx-translate/core, 2 to 8 November 2026](https://api.npmjs.org/downloads/point/2026-11-02:2026-11-08/%40ngx-translate%2Fcore): **1,912,458** downloads.
- [npm, @ngx-formly/core, 2 to 8 November 2026](https://api.npmjs.org/downloads/point/2026-11-02:2026-11-08/%40ngx-formly%2Fcore): **311,233** downloads.

Graph assets in `public/metrics/` are static SVGs generated from these sources:

- [ngx-translate daily source](https://api.npmjs.org/downloads/range/2025-11-10:2026-11-08/%40ngx-translate%2Fcore) and [ngx-formly daily source](https://api.npmjs.org/downloads/range/2025-11-10:2026-11-08/%40ngx-formly%2Fcore), 10 November 2025 to 8 November 2026. Aggregate the 364 daily values into **52 complete Monday-to-Sunday weekly totals**. Plot one point per week with a zero baseline. The last points equal the displayed 1,912,458 and 311,233. Do not plot daily counts beneath a weekly headline. Reject missing dates or incomplete weeks instead of inventing zero downloads. Keep actual zero values returned by npm. Each SVG preserves its weekly totals in metadata. Generation checks cover weekday/weekend aggregation, date continuity, partial weeks, and agreement with the headline counts.
- [Stack Overflow public reputation events](https://api.stackexchange.com/2.3/users/11135174/reputation-history?site=stackoverflow&pagesize=100), checked 9 November 2026. The latest 100 events span 9 March 2025 to 20 August 2026. Group the changes by UTC date and plot their cumulative sum across 66 dates. This follows the portfolio implementation and is not total reputation. The horizontal axis uses elapsed time.

Each graph includes its source and date range in its SVG description. The SVGs load locally, so the slide works without runtime API requests. Logos come from Simple Icons. The reference implementation is the user's portfolio at `/Users/raphael.balet/Documents/the-corner-factory/forge/websites/raphael-balet/src/components/portfolio/project-stats.tsx`.

These are static, dated snapshots of the core packages. Do not add the HTTP loader's downloads to the ngx-translate figure or describe downloads as unique people or applications. Refresh both figures and the displayed date together if needed before the talk. Source links open in a new tab so the presentation stays in place.

Suggested opening speaker notes:

"I'm Raphaël, an Expert Developer at BIT. Before we talk about forms, a quick introduction through my vanity metrics. Stack Overflow gave me a gold badge for visiting 100 days in a row. Yes, Fanatic is the official name. You'll also find my actual answers there. I help maintain ngx-translate, with about 1.9 million downloads a week, and ngx-formly, with about 311,000. That last one is why we're here. We keep solving the same form problems across teams, and I'd like to show what we could share."

## Chapter 02

Developed from the user's handwritten "Problems" notes. The title starts as "The Problems" and changes to "The Solutions" once a problem is selected. Selecting the current problem keeps its solution open. Previously shown solutions keep their original top-to-bottom order when revisited, with summaries above and below the selected solution. Each summary keeps its solution icon; clicking the summary or icon reopens that solution. Keep the five-minute allocation and the stable `chapter-02` anchor.

The story follows joining one project and building a form, then joining another project with familiar form requirements and a different stack. Six static form illustrations repeat the same name and email fields across six distinct designs: Material-inspired, Bootstrap-inspired, custom, rounded fields, a compact layout and a high-contrast design. The user approved illustrative examples for now; the caption labels the fictional data. These are presentation illustrations, not live forms or screenshots of BIT applications.

The three requirements follow the sketch:

1. **Price:** include ongoing maintenance; open source and maintenance shared with colleagues. No cost or savings estimates.
2. **Extensible:** core, builder and MCP; shared form logic across projects and tools.
3. **Adaptive:** choose components (PrimeNG, Material, Angular Aria) and preserve the project's visual design (Material, Bootstrap or custom).

"aria" is interpreted as [Angular Aria](https://angular.dev/guide/aria/overview), the headless accessible directives, rather than a visual theme. The requirements describe the desired shared approach; they do not claim a shipped Formly adapter for Angular Aria. [Formly's setup guide](https://formly.dev/docs/guide/getting-started/) documents its Material, Bootstrap and PrimeNG themes.

Content lives in `src/components/problem-chapter.ts` and `src/components/problem-requirements.ts`. It uses the chapter scroll motion and navigation. Examples and requirements stack on mobile. Navigation must keep chapter 02 active while scrolling through its longer content.

Suggested speaker notes:

"I join a project and we build a form. Then I move to a second project. The fields look familiar, but the stack and the design are different. We write validation, conditional logic and API integration again, and then maintain each implementation. These illustrations show the repetition. What could we share? A foundation we can maintain together, extend with a builder and MCP, and adapt to each project's design. That brings us to ngx-formly."

## Next work

Rehearse the complete flow in PRESENTING.md. Confirm the real Periscope environment before the talk and complete the builder repository release separately. The presentation itself uses the hosted Studio import flow and does not depend on an npm publication.

## Completed interactive presentation

- Chapter 05 uses CodeMirror and jsonc-parser, matching the upstream Formly validator. Its editor loads when the chapter enters the viewport. Validation source and its MIT license are in `src/demo/formly-validator/`.
- Chapter 03 renders real Formly fields and shows their configuration. Chapter 04 presents the installed skill prompt to update the shared form configuration, then leads directly to chapter 05 to review the agent’s result. Chapter 05 starts with chapter 03’s configuration and checks an independent JSON draft without executing it.
- Chapter 06 retains its heading and navigation; its content is empty until the headless component example is added.
- Chapter 07 switches between events, workflows and surveys, showing three Formly capabilities and a matching illustration for each area. Chapters 11 and 12 contain two audience prompts and future plans. Chapter 03 demonstrates language switching beside the live form while retaining model keys and answers.
- Presentation controls and summaries are translated into English, German and French; validator diagnostic details retain the upstream English wording. Desktop focus view and keyboard navigation support live presenting; fields retain their normal keyboard behavior.
- [PRESENTING.md](PRESENTING.md) contains the full run of show and rehearsal steps.
- [Builder release handoff](docs/builder-release.md) records the tested npm candidate, durable version patch and genuine publication prerequisites. Nothing has been published.

Before the talk, rehearse the agent prompt and real Studio import, then start/sign into Periscope. Local simulations are clearly identified in the deck.
