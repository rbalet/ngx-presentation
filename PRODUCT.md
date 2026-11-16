# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

BIT developers are the primary audience. They build and maintain forms across projects and need to see which work they can share while keeping each project's component library and design. BIT management is a secondary audience whose support can help teams agree on ownership and maintenance.

## Product Purpose

“Why are we still rebuilding the same forms?” is a presenter-led talk in English (default), German or French by Raphaël Balet, an Expert Developer at BIT. It introduces ngx-formly and seeks support for a shared approach to building and maintaining forms at BIT. The proposed next step is to pick one use case, agree who owns the shared components, and demonstrate reuse in a second application.

## Positioning

ngx-formly describes Angular forms as configuration. Teams can reuse field behavior and validation while choosing components that fit each application. The talk connects that mechanism to recurring BIT form work through Periscope, an event, workflow and survey tool.

## Operating Context

The session has a 60-minute slot. The main talk takes 41 minutes, the optional multilingual forms chapter adds four, and Q&A takes 15. The presenter scrolls through the deck, jumps via the chapter index, and can skip the extras to go directly to What's next, followed by Q&A. A start and reset timer tracks the full slot and survives a reload in the same browser when local storage is available.

## Capabilities and Constraints

- Keep the cover unnumbered and the chapter anchors stable: `#chapter-01` through `#chapter-09`, plus `#chapter-11` and `#chapter-12`. Chapter 09 is optional, chapter 10 was removed, chapter 11 is Q&A, and chapter 12 covers future plans.
- The complete talk includes a shared event-registration example, a prompt for a coding agent to implement a form in subsection 04.1, live Formly interactions, configuration export to the hosted builder, and a sourced Periscope walkthrough. The agent result subsection starts with a placeholder.
- Distinguish skill instructions, MCP tooling and browser-side WebMCP. The API exercise is explicitly simulated. Periscope is shown as a documented walkthrough; a live environment is a separate presenter prerequisite.

## Evidence on Hand

- The introduction uses a Stack Overflow badge and npm package download counts. The charts in `public/metrics/` are dated snapshots. The handoff records their sources, the agenda, content decisions and speaker notes. [HANDOFF.md](HANDOFF.md)
- The problem chapter uses three illustrative forms with fictional data to show how the same fields recur across designs. The Formly logo is stored at `public/formly.svg`.

## Product Principles

- Start with work developers repeat, such as validation, conditional behavior and API integration. Use those examples to explain what teams could maintain together.
- Preserve each project's component and design choices when describing shared form behavior.
- Keep translation optional so the presenter can protect discussion time.
- Use sourced figures and verified demo details. Leave BIT adoption and savings claims open until evidence is available.

## Accessibility & Inclusion

Preserve keyboard navigation, the skip link, direct chapter links, and the reduced-motion fallback for transitions and smooth scrolling. Keep chapters readable on narrow screens without horizontal scrolling.
