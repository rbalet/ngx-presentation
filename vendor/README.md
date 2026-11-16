# Builder consumer trial

Chapter 06 consumes the headless root of `@ngx-formly/builder` as an ordinary Angular package. The tarball was built on 16 November 2026 from the sibling repository's working tree, based on commit `0d67fdc43ab863ca072b2170c9693b994223bad0`, **including the uncommitted headless-root changes**. It retains version `0.0.1` for this local trial; a pending minor changeset records the breaking migration before publication. There are no source aliases, deep imports or copied engine implementations in the presentation.

- Source: https://github.com/ngx-formly/ngx-formly-builder
- Artifact: `ngx-formly-builder-0.0.1-headless.tgz`
- SHA-256: `4ed4ed112ca04ed2566fb814d19f7d6f345287b4a673c7321fb3499e476e79ed`
- Package license: MIT; LICENSE is included in the tarball.

## What the demo reuses

`provideBuilderEngine` creates a chapter-local environment injector. `BuilderEngineService` owns field identity, configuration edits, ordering, removal and clean Formly JSON export. The host provides an in-memory implementation of `FormStoreService` and renders the exported preview configuration using the presentation's registered Formly types.

The UI supports input, textarea and select fields; labels and required flags; move up/down; remove; reset; validation preview; and JSON download. It deliberately leaves nested groups, repeaters, arbitrary JSON import, choice-option editing, drag and drop and persistent workspaces to the full editor. Controls translate with the presentation; field labels are editable document content and keep their values when the UI language changes. Reset takes a fresh, localized snapshot from chapter 03. Unvalidated chapter 05 drafts are not imported.

## Headless package changes

The library was updated directly:

- `@ngx-formly/builder` exports the engine, document model, persistence contracts/providers and validation-expression helper.
- `@ngx-formly/builder/ui` exports the ready-made editor, UI providers, theme, baseline fields and extension contracts. It imports the root engine so both entry points share injection tokens and state.
- Only Angular common/core/forms, Formly core and RxJS remain required peers. All 16 UI peers are optional. Lodash, mutative and UUID are implementation dependencies.
- The packed headless-consumer fixture installs without UI peers, checks their absence, rejects UI code in its production graph and enforces a 400 kB initial bundle budget. Its whole Angular app builds to 182.74 kB raw / 52.77 kB estimated transfer.
- UI consumers must change editor imports to `/ui` and explicitly install the UI peers listed in the builder's embedding guide. Stored forms and local-storage keys are unchanged.

The presentation keeps its public root imports and consumes the rebuilt tarball. Its lockfile no longer installs Material/CDK, Tailwind, Terser, file-saver, js-beautify, markdown tooling or drag/drop through the builder. Existing CodeMirror dependencies belong to the presentation's own code editors.

## Production bundle comparison

Measured with `pnpm build --stats-json` on the same presentation and Angular versions, comparing the original combined package with the new headless root:

| Output | Before, raw / estimated transfer | Headless, raw / estimated transfer |
| --- | --- | --- |
| Initial application | 560.22 kB / 144.85 kB | 543.78 kB / 141.55 kB |
| Deferred `form-builder` chapter chunk | 1,253.47 kB / 266.37 kB | 85.47 kB / 23.54 kB |
| Extra builder dialog chunk | 96.95 kB / approximately 22.7 kB | Not emitted |

The chapter chunk shrank **93.2% raw and 91.2% estimated transfer** (1,253,465 to 85,475 bytes raw). This measures the complete chapter chunk, not the engine alone; shared chunks are excluded. The initial application includes shared code. Transfer sizes are Angular CLI estimates, not measured network traffic.

The new production graph contains no builder UI entry point, Material/CDK, Terser, file-saver or js-beautify. The corresponding CommonJS optimization warnings are gone. The chapter remains deferred until chapter 06 is reached.

## Verification and release assessment

Passed after the headless split:

- Presentation production build, Angular/TypeScript checks and EN/DE/FR catalogue audit.
- All six builder browser tests across desktop and mobile: editing, ordering, removal, reset, validation, conditional visibility, JSON export, empty state, all field types, translation, themes, keyboard navigation and overflow.
- All 664 builder workspace unit tests, lint, Studio production build, documentation checks/build, package contracts and public API snapshot check.
- Packed clean installations, strict peer checks and production builds for both root-only and `/ui` consumers; one headless and nine UI browser tests passed.
- Release-artifact checks, release-guard tests and an isolated versioning dry run. The pending breaking-change changeset still needs version preparation before publication.

The earlier presentation integration also passed 63 presentation/presenter/URL/translation regression tests (one intentional skip). Its broader form run passed 30 of 32 tests; two existing WebMCP assertions expected a paragraph absent from the template. The subsequent Formly 11.3 WebMCP migration corrected those assertions and passed the full presentation suite: 122 tests passed, with two intentional mobile skips, including native Chromium WebMCP calls.

**The headless integration now works without UI dependencies, and the bundle regression is covered by a clean consumer check.** This supports an experimental release after version preparation and the repository's release workflow. It does not establish stability of every Studio feature. The full Studio browser suite, npm publication, a supported-version compatibility matrix and real-device Safari/Firefox behavior were not assessed. The optional UI build still has its existing bundle-size and CommonJS warnings.

## Rebuild the dependency

From the sibling `ngx-formly-builder` checkout:

```sh
pnpm install --frozen-lockfile
pnpm run build:core
pnpm --dir libs/core pack --pack-destination ../../packages
pnpm run check:packages:e2e
```

Copy `packages/ngx-formly-builder-0.0.1.tgz` into this directory as `ngx-formly-builder-0.0.1-headless.tgz`, then from the presentation root:

```sh
pnpm add ./vendor/ngx-formly-builder-0.0.1-headless.tgz
pnpm typecheck
pnpm check:i18n
pnpm build --stats-json
pnpm exec playwright test tests/form-builder.spec.ts
```

Use a new artifact filename or a new library version for subsequent builds to avoid stale local-tarball caching. Record the source revision and checksum, and commit the tarball together with `package.json` and `pnpm-lock.yaml` so a fresh checkout needs no sibling repository.
