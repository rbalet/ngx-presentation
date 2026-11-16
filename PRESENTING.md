# Presenting the form story

The thread through the talk is one event-registration form: describe it, generate its configuration with the ngx-formly skill, try it, change it, and take it into Formly Studio. Periscope is the final product example. Invite a colleague to choose a change before opening the builder.

## Before the session

1. Run `pnpm dev` and open the URL it prints. Choose the presentation language and theme before the audience arrives.
2. Open [Formly Studio](https://builder.formly.dev/workspaces/forms) in another tab. Rehearse its **Import Form** flow with the JSON exported in chapter 05. Import is a manual handoff; the Studio does not accept a form through its URL.
3. Prepare the actual Periscope environment and sign in separately. The deck's Periscope walkthrough explains the product with fictional data; it is not a production screen capture or a connected backend.
4. Try the generated form once, reset it, and return to the cover. Reset the presentation timer if this browser has been used for a rehearsal.

Use **Focus view** on desktop to hide the chapter index. Left/right arrows or Page Up/Page Down move between slides; these shortcuts leave form controls alone. Normal scrolling, chapter links, and the mobile index remain available. Use the header language selector at any time. Animations follow the browser's reduced-motion preference.

## Run of show

| Chapter | Time | Demonstration / speaker cue |
| --- | ---: | --- |
| 01 · About me | 2 min | Introduce the maintainer perspective. Download metrics are dated snapshots, not unique users. |
| 02 · The Problems | 5 min | Ask who has rebuilt the same validation in a second project. Reveal the three solutions. |
| 03 · Meet ngx-formly | 7 min | Connect field configuration, native controls, validation, and the model. Change attendance to show conditional behavior. |
| 04 · From prompt to form | 4 min | Copy the prompt into your coding agent, then show its repository changes in subsection 04.1. Review the working form together. |
| 05 · Make it yours | 6 min | Ask a colleague for a field-label or required-field change. Preview it, export the configuration, import it into the real Studio and continue editing there. |
| 06 · API & validation | 4 min | Trigger invalid input and the labeled mock API response. Discuss which validation belongs in the browser and which the API must enforce. |
| 07 · Periscope | 8 min | Walk through events, workflows and surveys, then switch to the actual application if it is running. Reuse the same registration story. |
| 08 · A shared approach at BIT | 2 min | Pick one form, one owner and a second application in which to prove reuse. No adoption or savings claims. |
| 09 · Multilingual forms | 4 min, optional | Switch labels and validation language while keeping model keys stable. Skip this chapter when discussion needs the time. |
| 12 · What's next | 3 min | Discuss the framework-independent and shared accessible-component ambitions as future work. |
| 11 · Q&A | 15 min | Ask which repeated behavior the team would share first. |

The original chapter IDs and agenda allocations stay stable: 41 minutes of main content, four optional minutes, 15 minutes of discussion. Chapter 12 comes before Q&A so discussion closes the session.

## The skill demonstration

Chapter 04 contains a copyable prompt and a dedicated result subsection at `#chapter-04-result`. Open this repository in your coding agent and paste the prompt. It asks the agent to replace the placeholder in `src/components/skill-result.ts` with a working form, reusing the shared Formly state and field types. Once the changes are saved, return to subsection **04.1 · Agent result** to review and try the form before moving to the builder. The development server reloads the changes; a production build must be rebuilt to include them.

The result subsection starts empty so the audience sees the agent's actual work. The browser does not call an AI service. Rehearse the prompt with your agent before the session; chapters 03 and 05 retain the bundled form for the rest of the demonstration.

Useful review questions:

- Do the keys match the submission contract?
- Are the types registered in this application?
- Which fields are required, and when should conditional values be cleared?
- Are validation and translated messages understandable?
- Can the exported configuration be imported into the builder without losing its behavior?

## Network and demo boundaries

The presentation, translations, local form interactions and Periscope walkthrough run locally. Formly Studio needs a network connection. The API demonstration is a deterministic simulation; it makes no submission to a real registration service. The exported fixture uses fictional example data.

If Studio is unavailable, use the in-deck field editor and inspect/export its configuration. If Periscope is unavailable, keep the labeled walkthrough on screen and describe the application from the verified project behavior. Do not describe either fallback as a live backend demonstration.

No npm publication is needed to run this deck. Publishing `@ngx-formly/builder` is a separate release of the builder repository; see the release preflight notes in the implementation handoff.
