# Language experience lifecycle

This document defines how primary-page changes are audited and how each
affected language is updated under EPIC #145. It applies to copy, navigation,
dynamic demonstrations, accessibility text, metadata, visual meaning, music
or performance labels, and RTL/LTR presentation.

## What the impact report does

`config/language-impact-manifest.json` is the repository manifest for the
shipped locales and user-facing surfaces. The report implementation is
`scripts/language-impact-report.mjs`.

The report classifies changed files as follows:

| Change | Affected languages |
| --- | --- |
| Shared route, component, content, workflow, or presentation surface | Every shipped locale |
| `src/client/i18n/<locale>.json` | That locale only |
| `src/client/i18n/meta/<locale>.json` | That locale only |
| Documentation, tests, scripts, issue records, or workflow-only files | None |
| Unknown client surface | Every locale, with `needs_review: true` |

The output is deterministic and contains `changed_files`,
`affected_languages`, classification reasons, and one review-required FEAT
proposal per affected language. It never creates issues, labels, approvals,
pull requests, merges, or deployments.

## Running the report locally

Install dependencies and run the focused contract tests:

```bash
npm ci
npm run test:language-impact
```

For a known base and head commit:

```bash
node scripts/language-impact-report.mjs \
  --base <base-sha> \
  --head <head-sha> \
  --json language-impact/report.json \
  --markdown language-impact/report.md
```

For a list of files without Git history:

```bash
node scripts/language-impact-report.mjs \
  --files src/client/routes/Home.tsx,src/client/i18n/he.json \
  --json language-impact/report.json \
  --markdown language-impact/report.md
```

The `Language browser audit` workflow runs this report automatically for pull
requests and pushes to `main`. It uploads `language-impact/report.json` and
`language-impact/report.md` in the `language-localization-evidence` artifact.

To download evidence from a completed run:

```bash
gh run download <run-id> \
  --repo UzorAI/uzorai.com \
  -n language-localization-evidence
```

## Creating language work

After reviewing `affected_languages`, create one governed FEAT issue for each
language. Each FEAT belongs to EPIC #145 and should identify its locale, the
primary change that caused it, affected routes and states, wording owner, and
required evidence. Shared implementation can be reused, but approval and
completion remain language-specific.

Create a child EPIC when the language work needs multiple phases, such as a
new visual or music system, culturally specific color meaning, a substantial
RTL/LTR redesign, or a long-running terminology decision. A single translation
change remains a FEAT.

Do not use automatic translation or automatic issue creation as completion.
Language owners and designated reviewers must decide terminology, brand tone,
accessibility, and cultural fit.

## Implementing a language FEAT

For each language branch:

```bash
git switch main
git pull --ff-only
git switch -c htu/feat-language-<locale>-<issue-number>
```

Audit every route and conditional state affected by the primary change. Check
dictionary and metadata parity, dynamic labels, accessibility names, mobile
layouts, and rendered output. Preserve product names, protocol names,
technical identifiers, URLs, commands, and file names when they are not
translatable user-facing prose.

At minimum, run:

```bash
npm run test:language-impact
npm test
npm run build
```

The FEAT should also render or crawl its locale, exercise menus and dynamic
states, inspect responsive presentation, and search the production build for
unintended source-language strings. RTL locales must verify document direction,
logical spacing, ordering, mixed-script readability, and horizontal overflow.

## Pull request and deployment gates

Every language update uses its own review PR linked to its FEAT and EPIC #145.
The PR must include the report evidence, changed routes/states, translation
decisions, tests, and any intentionally retained Latin text. Required
repository reviewers and language or brand owners must approve before merge.

After merge, deploy through the governed workflow in order:

```bash
gh workflow run deploy.yml --repo UzorAI/uzorai.com --ref main -f target=dev
gh workflow run deploy.yml --repo UzorAI/uzorai.com --ref main -f target=demo
gh workflow run deploy.yml --repo UzorAI/uzorai.com --ref main \
  -f target=production -f confirmation=PROD
```

Wait for each environment to pass before promoting to the next. Production
requires the literal `PROD` confirmation. The impact report itself never
deploys.

## Completion record

Close the language FEAT only when its rendered audit, parity checks, build,
responsive/RTL review, and required approvals are recorded. Keep EPIC #145
open while lifecycle automation or other language-specific work remains.
