# Presentation handoff

## Goal

Present ngx-formly to BIT colleagues and management to gain support for a shared form approach. The talk is in English. The full slot is 60 minutes, with up to 45 minutes of presentation and 15 minutes of Q&A.

Title: **Why are we still rebuilding the same forms?**

Subtitle: **Reusable forms for people and AI with ngx-formly.**

The user chose TanStack Start, React and Motion for a scrolling presentation. Work through one chapter at a time. The current implementation is the shell and short topic summaries, not the finished presentation.

## Chapter numbers

| Chapter | Topic | Minutes | Status |
| --- | --- | --- | --- |
| 01 | Background and role at BIT | 2 | Main |
| 02 | Repeated form implementation | 5 | Main |
| 03 | Introduction to ngx-formly | 7 | Main |
| 04 | MCP and WebMCP | 4 | Main |
| 05 | Playground | 6 | Main |
| 06 | API integration and validation service | 4 | Main |
| 07 | Periscope | 8 | Main |
| 08 | A shared form approach at BIT | 2 | Main |
| 09 | Multilingual forms with ngx-translate | 4 | Optional extra |
| 10 | Portless development workflow | 3 | Optional extra |
| 11 | Q&A | 15 | Discussion |

The main content totals 38 minutes. The extras add 7 minutes and may be skipped. Keep the numbers stable when developing each chapter.

## Content decisions

- Treat MCP/WebMCP as implemented for the presentation, as the user requested. The scaffold does not implement an MCP server or WebMCP integration itself.
- Periscope is the user's event, workflow and survey tool. Its actual screens and demo flow are still needed.
- The exact validation service and intended playground still need clarification. The earlier slide draft used ngx-formly Builder as the proposed playground.
- Keep Portless and translation optional. They support the main presentation but must not displace it.
- Do not invent adoption statistics, time savings or Periscope implementation details.

## Current setup

- Repository: `/Users/raphael.balet/Documents/Open-source/ngx-presentation`.
- Run `npm run dev` on port 4310.
- Chapter IDs are `chapter-01` through `chapter-11` and support direct hash links.
- Motion applies a small scroll-linked vertical transition. Reduced-motion mode disables it and smooth anchor scrolling.
- Navigation uses normal links, with a skip-extras link before the optional chapters.
- No hosting, authentication, backend or demo integration is configured.

## Next work

Ask which chapter the user wants to develop. Start there and leave the other chapter summaries intact. The final visual treatment and demo content can be developed with each chapter.
