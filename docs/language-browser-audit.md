# Language browser audit

Run the language browser audit at the end of any commit that changes rendered
UI. This includes routes, components, navigation, dialogs, forms, demos,
workflow labels, accessibility text, metadata, fonts, CSS layout, colors,
responsive behavior, and visual or musical presentation. A translation JSON
change also counts when it can change what a user sees.

The audit covers every shipped locale (`en`, `es`, `ru`, `zh`, `ar`, `he`,
`fr`, and `uk`), both host roles (`uzorai.com` and `uzor.ai`), all configured
routes plus the missing-page route, and desktop/mobile widths. It checks locale
and direction attributes, page errors, visible alerts, locale switching, and
horizontal overflow.

## Run after a local commit

From the repository root, build the production bundle first, then run the
browser audit:

```bash
npm ci                 # first run or after package-lock changes
npm run build
npm run test:language:browser
```

The test command starts a local Vite preview server on `127.0.0.1:4173` and
serves it through intercepted `uzorai.com` and `uzor.ai` requests. It does not
contact the deployed sites. A successful run reports 49 tests: the shared
all-locale smoke tests plus the detailed Arabic and Hebrew interaction suites.

Run the list command when checking that the locale inventory is present:

```bash
npm run test:language:browser -- --list
```

If the audit fails, inspect the Playwright trace and JSON evidence under
`test-results/`. Fix the UI, locale dictionary, direction, or overflow issue,
create the next commit, and rerun the build and audit before opening or
updating the PR. Do not hide untranslated text with clipping or add a Latin
exception unless the text is a brand, protocol, technical identifier, URL,
command, or other intentionally retained name.

## Run on GitHub Actions

The `Language browser audit` workflow runs automatically for every pull request
and every push to `main`. To run it manually against a branch or commit:

```bash
gh workflow run language-browser.yml \
  --repo UzorAI/uzorai.com \
  --ref <branch-or-commit>
```

Find the run and wait for its result:

```bash
gh run list --repo UzorAI/uzorai.com --workflow language-browser.yml --limit 5
gh run watch <run-id> --repo UzorAI/uzorai.com --exit-status
```

Download the generated report, screenshots, traces, and route snapshots from
the `language-localization-evidence` artifact:

```bash
gh run download <run-id> \
  --repo UzorAI/uzorai.com \
  -n language-localization-evidence
```

The workflow also writes the governed language-impact report. Review it before
merging so every affected locale has the required FEAT or EPIC work under
EPIC #145. A passing browser audit does not replace required code-owner,
language-owner, or deployment approvals.

## Commit and PR checklist

At the end of a visual/UI commit:

1. Run `npm run build`.
2. Run `npm run test:language:browser`.
3. Review `test-results/` for every locale and responsive width.
4. Review the language-impact report and update affected language FEATs.
5. Include the audit result and any intentionally retained Latin strings in the
   PR description.
6. Wait for the GitHub workflow, required reviewers, and deployment gates.

Do not merge or deploy solely because the local browser run passed.
