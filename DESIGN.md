---
name: ngx-formly presentation
description: Warm paper, red chapter accents, and working forms for a presenter-led technical talk.
colors:
  paper: "#f8f6f1"
  ink: "#000"
  dark-surface: "#172738"
  on-dark: "#f8f6f1"
  action: "#172738"
  surface: "#fffdfa"
  group: "#eeebe5"
  group-rule: "#d3c9be"
  highlight: "#f0ece5"
  extra: "#efede6"
  muted: "#586575"
  red: "#b92e36"
  success: "#4f6b52"
  rule: "#d9d6d0"
  dark-paper: "#1d1a1b"
  dark-ink: "#f8f6f1"
  dark-dark-surface: "#12151c"
  dark-action: "#f8f6f1"
  dark-surface-raised: "#282426"
  dark-group: "#232022"
  dark-group-rule: "#51484d"
  dark-highlight: "#332b2e"
  dark-extra: "#252124"
  dark-muted: "#a6a1ad"
  dark-red: "#ff9a9e"
  dark-success: "#a7c9ab"
  dark-rule: "#524a4e"
typography:
  display:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "clamp(2.375rem, 5.5vw, 6rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline-compact:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "clamp(2.25rem, 4vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "clamp(1.15rem, 1.6vw, 1.5rem)"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 700
  code:
    fontFamily: "'SFMono-Regular', Consolas, monospace"
    fontSize: "clamp(0.72rem, 1vw, 0.9rem)"
    lineHeight: 1.6
rounded:
  control: "6px"
  header: "8px"
  card: "12px"
  group: "16px"
spacing:
  control-gap: "0.5rem"
  inset: "1rem"
  card-inset: "1.5rem"
  column-gap: "2rem"
  gutter: "clamp(1.25rem, 5vw, 5rem)"
  slide-inset: "clamp(1rem, 3svh, 2.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0.65rem 0.85rem"
  button-primary-hover:
    backgroundColor: "{colors.red}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.65rem 0.85rem"
  text-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.55rem 0.65rem"
  chapter-navigation:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  selection-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.5rem 1.125rem"
  selection-chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  preview-sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "clamp(1rem, 2vw, 1.5rem)"
  code-window:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.on-dark}"
    typography: "{typography.code}"
    rounded: "{rounded.header}"
    padding: "1rem"
  focus-toggle:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.header}"
    padding: "0.35rem 0.75rem"
---

# Design System: ngx-formly presentation

## Overview

**Creative North Star: "Warm paper, working forms"**

A technical talk with the clarity of a printed chapter and the immediacy of a working example. Warm paper, black Arial headings, red chapter numbers, and fine rules establish the visual identity. The design is an extension of the existing presentation: the cover, chapter typography, sidebar, dark theme, and motion remain its foundation.

Live forms, configuration, and walkthroughs use the same surfaces and controls as the surrounding talk. Large headings orient the room; compact supporting text and paired columns make changes visible without competing with the example. Depth comes from surface color and borders, not shadows.

**Key Characteristics:**
- Warm paper and a restrained red accent, with a complete dark theme.
- Bold system sans typography and tabular chapter numbers.
- Ruled navigation, generous chapter spacing, and practical native controls.
- Small, purposeful reveals with a reduced-motion fallback.

## Colors

Warm neutrals carry the page, red marks structure and attention, and muted green identifies completion or success. The frontmatter records the light-theme values first; `dark-*` entries record the actual dark-theme overrides rather than additional UI roles. Source custom properties live in `src/styles.css`.

### Primary

- **Chapter red** (`red`): chapter numbers, emphasized phrases, links on hover, keyboard focus, required markers, and errors.
- **Action navy** (`action`): filled actions in the light theme. This resolves from `dark-surface`; in the dark theme, actions resolve from `ink` so they remain visible.

### Secondary

- **Success green** (`success`): completion ticks, live form status, successful validation, and connection diagrams. Accompany it with text or an icon.

### Neutral

- **Warm paper** (`paper`) and **ink** (`ink`): the page canvas and primary text.
- **Raised paper** (`surface`): form previews, fields, and metric cards.
- **Grouped paper** (`group`, `group-rule`): prompt sheets, walkthrough detail, and grouped content boundaries.
- **Highlight** (`highlight`): hovered or active navigation and header controls.
- **Extra paper** (`extra`): optional chapters.
- **Muted ink** (`muted`): explanatory notes and implementation captions.
- **Rule** (`rule`): quiet dividers around navigation, list rows, and sections.
- **Dark surface** (`dark-surface`) and **on-dark** (`on-dark`): code windows and the Q&A chapter. The Q&A chapter retains a light foreground in both themes.

**The Theme Pair Rule.** Carry background and foreground roles together; a dark surface always needs its on-dark foreground. Component states must stay readable in both themes.

Illustrative forms in the problem chapter intentionally demonstrate different component libraries. Their purple, blue, green, and yellow treatments are local examples, not additions to the shared palette.

## Typography

**Display and body font:** Arial, Helvetica, sans-serif. **Code font:** SFMono-Regular, Consolas, monospace. No downloaded display font is required.

The character comes from size, weight, and spacing: tight, bold headings against regular body copy. Headings balance their lines; the cover is limited to 16 characters per line and highlights its final phrase in red. Chapter numbers are smaller, regular weight, and use tabular numerals.

- **Display:** cover title; use the frontmatter's display role. At narrow widths the existing cover uses a viewport-based scale, and short screens reduce its maximum size.
- **Headline:** chapter title; compact chapter titles use the smaller observed scale when the content needs more projection space.
- **Title:** headings within the form demos. Walkthrough and closing content retain their nearby component-specific scales.
- **Body:** regular explanatory text. Lead paragraphs grow with the viewport; demo leads use a maximum measure of 60ch and pilot explanations 65ch.
- **Label:** bold form labels and compact controls. Notes commonly use 0.85–0.9rem with 1.5 line height.
- **Code:** configuration and model data. Preserve code indentation and use a scrollable code window when necessary.

**The System Type Rule.** Keep Arial for the presentation and monospace for code. Scale and weight carry hierarchy; a new chapter does not introduce a new font.

## Layout

Each chapter is a vertical presentation surface with a minimum height of `100svh`, a fixed header, and content capped at 80rem. The shared gutter and slide inset come from the frontmatter. Slides can grow with their content; readable controls and text take priority over forcing a fixed-height box.

At widths of 1200px and above, the presentation reserves a 23rem right column for the sticky chapter index. Its list scrolls independently when necessary. Focus view hides that index, lets the presentation use the available width, and caps the outer layout at 94rem. The focus control is hidden below this breakpoint, where the index participates in document flow.

The header is 4.5rem high, reducing to 3.5rem at widths up to 700px. The cover and chapters reserve space for it. Multi-part chapters use a sticky running title and offset subsequent content and focused controls accordingly. Chapter anchors and snap positions share that geometry.

Demo workbenches pair explanation or editing controls with the live form in equal flexible columns. They stack at 760px. Walkthroughs, closing examples, and problem layouts stack at 700px. At 375px and below, the shared gutter becomes 1rem and the slide inset 0.625rem. Existing short-screen rules reduce margins and split the opening chapters into continuation slides; additions should use the same approach before shrinking controls.

Spacing is contextual, with repeated half-, one-, one-and-a-half-, and two-rem steps rather than a separate utility scale. Actions wrap. Content columns use `minmax(0, 1fr)` so long content does not force page-wide overflow. Keep code overflow inside its window.

## Elevation & Depth

The shared system is flat. There are no reusable shadow tokens. Fine borders and the paper/surface/group tones distinguish adjacent regions. The header and sticky titles have opaque backgrounds; no blur or glass layer is required. Metric charts sit behind their values within a clipped card, while problem answers slide within their existing bordered container.

**The Flat Surface Rule.** Separate content with a rule or an existing surface tone before introducing depth effects.

## Shapes

Controls have small corners, header controls slightly larger corners, and cards more generous corners; the frontmatter records the observed radius vocabulary. Grouped metric content uses the largest radius. Cover links, ruled navigation, and the external Periscope link retain their square edges. Do not round every element to the same shape.

Small circular dots indicate live status; contributor portraits and isolated checkmark backgrounds are circular. Borders are generally one pixel. The problem solution container uses a two-pixel success border to make its state visible.

## Components

### Buttons and selection controls

Demo primary actions use the action/paper pair; secondary actions are transparent with a group-rule border. Both use the control radius, bold text, and a minimum hit height of 2.75rem. Hover switches demo actions to the red/paper pair. Pending form submission disables the relevant controls and keeps a visible status message.

Product areas, language examples, and discussion prompts use compact outlined buttons. A selected choice has a filled foreground/background treatment and `aria-pressed`. On the dark Q&A surface, discussion choices use the on-dark foreground and border; the selected choice reverses to an on-dark fill with dark-surface text. Header controls use their own border and highlight treatment; focus view remains a toggle, not a page transition.

### Inputs and form previews

The cover has scattered decorative form outlines, clipped to the hero behind its content. They use muted ink at 16% opacity and tint individually to chapter red at 32% on pointer hover, with a 240ms color transition only when reduced motion is not requested. These shapes have no form behavior or keyboard stops and are hidden from assistive technology.

The preview is a raised-paper card with a group-rule border. Inputs, selects, and textareas use the shared surface/ink pair, a stronger muted border, the control radius, and a minimum height of 2.75rem. Editor controls use that same visible boundary. Labels are visibly associated with their controls; required markers are red. Error text appears beside the field's red border and is linked with `aria-describedby`; `aria-invalid` communicates the state. Textareas can grow vertically.

The live indicator combines a small green dot with text. Chapter 03 places the shared language selector beside it in the form header; the title and controls wrap on narrow screens. Model and configuration details use native disclosure controls. Copy and submission outcomes use status regions so feedback is available without relying on motion or color.

Chapter 05 uses the Formly validator layout with a JSON editor on the left and diagnostics on the right. The editor provides line numbers and syntax highlighting and uses the existing surface, group, ink, muted, red and success tokens in both themes. The panels stack on mobile. Selecting a diagnostic moves keyboard focus to the relevant source. Structural checks leave the draft configuration unexecuted.

Chapter 03 embeds CodeMirror for the editable name-field JSON and read-only TypeScript, Angular and translation examples. Keep line numbers, folding, undo, wrapping, and keyboard focus inside the existing dark code surface. Tab leaves the editor; navigation keys edit or scroll the code without changing chapters. Valid JSON updates the form immediately; invalid drafts preserve the last working configuration. Supporting examples remain selectable and read-only.

The dark editor uses a local syntax palette: properties `#9cdcfe`, strings `#e9b998`, keywords `#c5a5e8`, numbers `#b5cea8`, types and tags `#83d6c5`, functions `#e4d69c`, and comments and line numbers `#a8b3c2`. These colors stay on `dark-surface` in both themes. Editor rules use `#465463`, selection uses `#3b5169`, and the active line uses translucent white `#ffffff0d`. Editor text is 14px with 1.6 line height; compact code labels use .8rem. These are code-reading roles, not new presentation accent colors.

### Chapter navigation and timer

Each chapter link is a ruled row with a red number, a title, and a tabular duration. The active row adds a highlight and bold text. Completed chapters cross out their title and replace the duration with a labeled success tick. The timer uses a native progress element and a separate start/reset button; overdue state uses red plus accessible text.

Keep the skip link, direct chapter links, and previous/next links. Arrow keys and Page Up/Down move through slides when the user is outside a form control; editing fields must retain their normal keys.

### Cards, walkthroughs, and code

Metric cards, the form preview, prompt sheet, and Periscope illustrations reuse the same rounded surface vocabulary. The Periscope walkthrough pairs three Formly capabilities on the left with the selected area's supplied illustration on the right. The images are bundled in `public/periscope/`, preserve their aspect ratios inside a consistent 3:2 frame, and stack below the text on mobile. Code windows use the dark-surface/on-dark pair and a distinct monospace face. Their role is to expose the real configuration and submitted model.

### Focus and motion

Keyboard focus uses a three-pixel red outline with a five-pixel offset. Tight scrolling containers move the offset inward to avoid clipping it. The Q&A chapter uses the light red focus color. Preserve native control semantics, visible labels, and usable hit areas.

Motion explains sequence: chapter completion draws a strike and tick; metric charts reveal sequentially; problem answers slide vertically. The common expressive easing is `cubic-bezier(0.16, 1, 0.3, 1)`. View-timeline chapter drift is progressive enhancement and ranges only 32px around the settled state.

Animations run only when reduced motion is not requested. Reduced motion restores immediate state changes, disables smooth scrolling, and removes chapter transforms. Chapter completion also keeps a plain-text-decoration fallback for forced colors. Full timings and breakpoints are recorded in `.impeccable/design.json`.

## Do's and Don'ts

### Do:

- **Do** extend the warm paper, Arial, red chapter accent, and ruled navigation already present.
- **Do** use semantic color pairs in both light and dark themes.
- **Do** keep visible focus, native controls, associated labels, and text feedback for state changes.
- **Do** let columns stack and chapters grow when their content needs space.
- **Do** retain reduced-motion fallbacks and keep animation tied to a visible change.

### Don't:

- **Don't** introduce a new font or palette for an individual chapter.
- **Don't** promote the illustrative form-library colors into shared theme roles.
- **Don't** add shadows or blur to surfaces that the existing system separates with borders and tone.
- **Don't** use color or animation as the only indication of a selected, invalid, or completed state.
- **Don't** shrink working controls to force a dense demo into one fixed-height viewport.
