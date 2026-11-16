# Builder demo and release handoff

Verified 15 November 2026 against `ngx-formly/ngx-formly-builder` commit
`770af6acfe49759637c840ccd65cca1313121c29`. Local and remote `main` matched.
The source checkout at `/Users/raphael.balet/Documents/Open-source/ngx-formly-builder`
was clean and remains unchanged. Nothing was committed, pushed or published.

## Presentation integration

The [hosted builder](https://builder.formly.dev/workspaces/forms) is available;
npm publication is not needed to demonstrate it. The presentation exports a plain
`FormlyFieldConfig[]` JSON array, without an envelope or application data.

1. Export the presentation's JSON, then open the builder in a new tab.
2. Choose **Workspace → Forms → Import Form**.
3. Name the form and paste the JSON or choose its downloaded file.
4. Leave **UI Library** empty to use **Vanilla**, then choose **Import Form**.
5. Select the name field, open **Field Edit**, and change **Label** to “Full name”.
6. Switch to **Preview** and change attendance between **On site** and **Remote**.
7. Use **Export Form** to retrieve the changed configuration.

The deployed builder was exercised with `input`, `select` and `textarea`, required
fields, and `expressions.hide: 'model.attendance !== "onsite"'`. Import, label
editing, preview updates and conditional hide/show all worked. The builder has no
URL import parameter or cross-origin message receiver; a link alone cannot import
the presentation's form. Imported documents are stored in that browser's local
storage. The verification created a synthetic “Presentation compatibility check”
document in the temporary in-app browser profile.

## Prepared npm candidate

Public npm lookups returned **E404** for `@ngx-formly/builder` and
`@ngx-formly/builder-state`. This is not a published release.

The repository already has 13 pending Changesets. Its existing `release:version`
workflow was rehearsed in `/private/tmp/ngx-builder-version-candidate`, producing:

| Package | Source version | Rehearsed candidate |
| --- | --- | --- |
| `@ngx-formly/builder-state` | 0.0.1 | 0.1.0 |
| `@ngx-formly/builder` | 0.0.1 | 0.1.0 |
| `@ngx-formly/builder-material-fields` | 0.0.1 | 0.0.1 |
| `@ngx-formly/builder-material` | 0.0.1 | 0.0.2 |

Changesets correctly updates the shell/state peer range to `>=0.1.0 <0.2.0`.
The [candidate patch](builder-release.patch) preserves the generated manifests,
changelogs, lockfile and consumed Changesets; it applies cleanly to the source
commit above. It has not been applied to the builder checkout. Do not rerun the
version command after applying it, or combine it with another version PR.

Packed candidates are in `/private/tmp/ngx-builder-version-candidate/artifacts`.
Their filenames, SHA-256 hashes and sizes are recorded in
[artifact metadata](builder-release-artifacts.json). No binaries are checked into
this presentation. Temporary directories may be cleared; the patch is the durable
record and the packages can be rebuilt from it.

## Verification

These checks passed in the isolated source snapshot:

- All four Angular package builds in partial-compilation mode.
- Package dependency contracts, release artifact checks and four public API snapshots.
- All **656 unit tests** across Studio, state, core and both Material packages.
- All five lint targets.
- Release artifact regression test and independent-version dry run.
- Clean tarball installation, TypeScript checking and Angular consumer build.
- A second clean consumer using a simulated state patch and unchanged dependents.
- Documentation checking: zero errors, warnings or hints.

The versioned candidate also passed all four package builds, contracts and release
artifact checks, followed by a clean packed-consumer build and **nine browser tests**
at desktop (1536 px), tablet (1024 px) and mobile (390 px) widths.
Its Studio production build passed outside the sandbox. After replacing the
temporary dependency symlink with a clean frozen installation, documentation
checking and the production documentation build also passed (25 pages and a search
index). The original builder checkout was not modified.

Commands used:

```sh
pnpm run build:builder-material
node scripts/check-package-contracts.mjs
node scripts/check-release-artifacts.mjs
node scripts/check-api.mjs
pnpm run test:release
pnpm test
pnpm run lint
pnpm run check:packages
pnpm run release:dry-run --consumer
pnpm run check:docs
# In the isolated version candidate:
pnpm run release:version
pnpm run check:packages:e2e
pnpm run build:studio
pnpm install --frozen-lockfile --ignore-scripts
pnpm run check:docs
pnpm run build:docs
```

The first sandboxed Studio builds exited with status 134; the same command passed
outside the sandbox. The first docs build failed resolving Astro compile metadata
through the linked dependency directory; a clean dependency installation resolved
it. Neither remains a demonstrated source-code failure.

The full Studio browser suite was not run. Studio emitted its existing initial-size
warning (4.45 MB against a 500 kB warning threshold; below the 5.5 MB error limit).
Documentation built with empty-i18n and missing-custom-404 content warnings.
Package consumer builds reported the existing optional OXC/`@emnapi` peer warnings
and CommonJS optimization warnings.
The consumer fixture uses the repository's explicit PrimeNG 21 / Angular 22 peer
overrides; passing with those overrides does not establish native Angular 22 peer
compatibility for PrimeNG 21.

## Publication blockers and resumption

The GitHub API reports **no repository environments**, so the documented protected
`npm-release` environment does not exist. The repository Actions secret list is
also empty. Organization-level secrets were not inspected, and no credential
values were read. The release workflow needs an authorized npm publishing identity
and its documented environment protection before publication.

The [release procedure](https://github.com/ngx-formly/ngx-formly-builder/blob/main/docs/releases.md)
requires a reviewed version PR before publishing; its workflow rejects the current
pending Changesets. The README also says the first public contract is intended as
a prerelease, while the current Changesets plan produces the stable numbers above.
Resolve that channel choice before publishing. For a prerelease, use the documented
`changeset pre enter next` workflow and regenerate the candidate rather than
publishing this stable rehearsal under `latest`.

To resume:

1. In the builder repository, confirm the source commit and inspect any intervening
   changes. Recompute the release plan if `main` moved.
2. Decide the first public channel and review the candidate. For the rehearsed
   stable plan, apply `docs/builder-release.patch` from this presentation to a
   builder branch and review the generated release files. For `next`, regenerate
   through Changesets prerelease mode instead.
3. Run the repository's release workflow on the version commit, including its full
   Studio browser suite, before merging/publishing the reviewed version PR.
4. Configure `npm-release` with the required reviewers and a publishing `NPM_TOKEN`
   for the four packages, using GitHub's secret controls. Do not paste credentials
   into this file or the chat.
5. Follow the repository's **Release packages** workflow: prepare/review/merge the
   version PR, verify CI and the Netlify deployment, then dispatch with `publish`
   checked on the reviewed `main` commit.

The [workflow](https://github.com/ngx-formly/ngx-formly-builder/blob/main/.github/workflows/release.yml)
and [embedding guide](https://github.com/ngx-formly/ngx-formly-builder/blob/main/README.md#embedding-contract-prerelease)
remain authoritative. Publishing from a library source directory would omit the
Angular build output; use the existing workflow and its `publishConfig.directory`.
