# Presentation handoff

## Goal

Present ngx-formly to BIT colleagues and management to gain support for a shared form approach. The talk is in English. The full slot is 60 minutes, with up to 45 minutes of presentation and 15 minutes of Q&A.

Title: **Why are we still rebuilding the same forms?**

Subtitle: \*_Extensive form manipulation with ngx-formly, a unified approach._

The user chose TanStack Start, React and Motion for a scrolling presentation. Work through one chapter at a time. Chapters 01 and 02 have their first full content. The remaining chapters contain short topic summaries.

## Chapter numbers

| Chapter | Topic                                  | Minutes | Status                          |
| ------- | -------------------------------------- | ------- | ------------------------------- |
| 01      | About me                               | 2       | Main, first slide implemented   |
| 02      | Repeated form implementation           | 5       | Main, first content implemented |
| 03      | Introduction to ngx-formly             | 7       | Main                            |
| 04      | MCP and WebMCP                         | 4       | Main                            |
| 05      | Playground                             | 6       | Main                            |
| 06      | API integration and validation service | 4       | Main                            |
| 07      | Periscope                              | 8       | Main                            |
| 08      | A shared form approach at BIT          | 2       | Main                            |
| 09      | Multilingual forms with ngx-translate  | 4       | Optional extra                  |
| 11      | Q&A                                    | 15      | Discussion                      |

The main content totals 38 minutes. The optional multilingual forms chapter adds 4 minutes and may be skipped. Keep the numbers stable when developing each chapter.

## Content decisions

- Treat MCP/WebMCP as implemented for the presentation, as the user requested. The scaffold does not implement an MCP server or WebMCP integration itself.
- Periscope is the user's event, workflow and survey tool. Its actual screens and demo flow are still needed.
- The exact validation service and intended playground still need clarification. The earlier slide draft used ngx-formly Builder as the proposed playground.
- Keep translation optional. It supports the main presentation but must not displace it.
- Do not invent adoption statistics, time savings or Periscope implementation details.

## Current setup

- Repository: `/Users/raphael.balet/Documents/Open-source/ngx-presentation`.
- Run `pnpm dev` through Portless and open the printed URL (normally https://ngx-presentation.localhost). Playwright bypasses the proxy and uses port 4310.
- Chapter IDs are `chapter-01` through `chapter-09`, plus `chapter-11` for Q&A, and support direct hash links. Chapter 10 was removed; the remaining numbers stay stable.
- Motion applies a small scroll-linked vertical transition. Reduced-motion mode disables it and smooth anchor scrolling.
- Navigation uses normal links, with a skip-extras link before the optional chapters.
- No hosting, authentication, backend or demo integration is configured.

## Chapter 01

Use "About me" as the title and "And my vanity metrics" as a smaller subtitle beneath it. Hide the duration on this slide; retain its two-minute allocation in the agenda.

The user requested a playful introduction inspired by simple three-card presentation slides. Keep Stack Overflow, ngx-translate and ngx-formly in that order, on one row on desktop. The two libraries share an **Open-source maintainer** container. The cards stack on small screens. Keep the existing scroll animation and reduced-motion support.

All three cards are neutral by default. Hovering a card turns its border and main metric the primary red; the highlight follows the pointer. Apply this only on devices that support hover to avoid a sticky highlight on touch screens.

Match the user's portfolio reference with a small source logo at the top right and a subtle graph behind the foreground content. Show exact npm counts, not abbreviated figures. Keep Fanatic as the Stack Overflow headline. The graph behind it shows public reputation gains, not visits or progress toward the badge.

Content lives in `src/components/about-chapter.tsx`. The slide introduces Raphaël Balet as an Expert Developer at BIT. It uses the Fanatic badge as the joke and ends the Formly card with "The reason we're here."

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

Developed from the user's handwritten "Problems" notes. The title starts as "The Problems", changes to "The Solutions" while a problem is selected, and returns when the selection is cleared. Keep the five-minute allocation and the stable `chapter-02` anchor.

The story follows joining one project and building a form, then joining another project with familiar form requirements and a different stack. Six static form illustrations repeat the same name and email fields across six distinct designs: Material-inspired, Bootstrap-inspired, custom, rounded fields, a compact layout and a high-contrast design. The user approved illustrative examples for now; the caption labels the fictional data. These are presentation illustrations, not live forms or screenshots of BIT applications.

The three requirements follow the sketch:

1. **Price:** include ongoing maintenance; open source and maintenance shared with colleagues. No cost or savings estimates.
2. **Extensible:** core, builder and MCP; shared form logic across projects and tools.
3. **Adaptive:** choose components (PrimeNG, Material, Angular Aria) and preserve the project's visual design (Material, Bootstrap or custom).

"aria" is interpreted as [Angular Aria](https://angular.dev/guide/aria/overview), the headless accessible directives, rather than a visual theme. The requirements describe the desired shared approach; they do not claim a shipped Formly adapter for Angular Aria. [Formly's setup guide](https://formly.dev/docs/guide/getting-started/) documents its Material, Bootstrap and PrimeNG themes.

Content lives in `src/components/problem-chapter.tsx`. It uses the existing chapter scroll motion and navigation. Examples and requirements stack on mobile. Navigation must keep chapter 02 active while scrolling through its longer content.

Suggested speaker notes:

"I join a project and we build a form. Then I move to a second project. The fields look familiar, but the stack and the design are different. We write validation, conditional logic and API integration again, and then maintain each implementation. These illustrations show the repetition. What could we share? A foundation we can maintain together, extend with a builder and MCP, and adapt to each project's design. That brings us to ngx-formly."

## Next work

Ask which chapter the user wants to develop. Start there and leave the other chapter summaries intact. The final visual treatment and demo content can be developed with each chapter.
