# Presenting the form story

The same event-registration form runs through the talk. Describe it, generate its configuration with the ngx-formly skill, try it, then edit and validate it. Periscope is the final product example. Invite a colleague to choose a change before opening the validator.

## Before the session

1. Run `pnpm dev` and open the URL it prints. Choose the presentation language and theme before the audience arrives.
2. Prepare the actual Periscope environment and sign in separately. The deck's Periscope walkthrough explains the product with fictional data; it is not a production screen capture or a connected backend.
3. Try the generated form once, reset it, and return to the cover. Reset the presentation timer if this browser has been used for a rehearsal.

Use **Focus view** on desktop to hide the chapter index. Left/right arrows or Page Up/Page Down move between slides; these shortcuts leave form controls alone. Normal scrolling, chapter links, and the mobile index remain available. Use the header language selector at any time, or the selector beside the live form in chapter 03. Animations follow the browser's reduced-motion preference.

## Run of show

| Chapter | Time | Demonstration / speaker cue |
| --- | ---: | --- |
| 01 · About me | 2 min | Introduce the maintainer perspective. Download metrics are dated snapshots, not unique users. |
| 02 · The Problems | 5 min | Ask who has rebuilt the same validation in a second project. Reveal the three solutions. |
| 03 · Meet ngx-formly | 7 min | Connect field configuration, native controls, validation, and the model. Change attendance to show conditional behavior. Use the form’s language selector to translate labels and errors without clearing answers. |
| 04 · Agentic Workflow | 4 min | Copy the prompt into your coding agent, then show its repository changes in subsection 04.1. Review the working form together. |
| 05 · API & validation | 6 min | Edit chapter 03’s JSON in the Formly validator. Try a wrong property type, select its diagnostic, then correct the value. |
| 06 · Make it yours | 4 min reserved | Empty for now; a headless component example will be added later. |
| 07 · Periscope | 8 min | Walk through events, workflows and surveys, then switch to the actual application if it is running. Reuse the same registration story. |
| 08 · A shared approach at BIT | 2 min | Pick one form, one owner and a second application in which to prove reuse. No adoption or savings claims. |
| 12 · What's next | 3 min | Discuss the framework-independent and shared accessible-component ambitions as future work. |
| 11 · Q&A | 15 min | Invite the audience to share what they think is missing. |

The remaining chapter IDs stay stable: 41 minutes of main content and 15 minutes of discussion leave four minutes of buffer in the 60-minute slot. Chapter 12 comes before Q&A so discussion closes the session.

## The skill demonstration

Chapter 04 contains a copyable prompt and a dedicated result subsection at `#chapter-04-result`. Open this repository in your coding agent and paste the prompt. It asks the agent to replace the placeholder in `src/components/skill-result.ts` with a working form, reusing the shared Formly state and field types. Once the changes are saved, return to subsection **04.1 · Agent result** to review and try the form before moving to the validator. The development server reloads the changes; a production build must be rebuilt to include them.

The result subsection starts empty so the audience sees the agent's actual work. The browser does not call an AI service. Rehearse the prompt with your agent before the session; chapters 03 and 05 retain the bundled form for the rest of the demonstration.

Useful review questions:

- Do the keys match the submission contract?
- Are the types registered in this application?
- Which fields are required, and when should conditional values be cleared?
- Are validation and translated messages understandable?

## Network and demo boundaries

The presentation, translations, form interactions, JSON validation and Periscope walkthrough run locally. The form uses fictional example data.

Chapter 05 reuses the validator behind [formly.dev/tools/validator](https://formly.dev/tools/validator). It checks JSON syntax and field structure locally without running the configuration. The draft starts with chapter 03’s fields, and edits stay in the validator. **Reset the demo** restores the example and resets the shared form. Diagnostic details use the upstream English wording. Controls and status summaries follow the presentation language.

If Periscope is unavailable, keep the labeled walkthrough on screen and describe the application from the verified project behavior.

No npm publication is needed to run this deck. Publishing `@ngx-formly/builder` is a separate release of the builder repository; see the release preflight notes in the implementation handoff.
