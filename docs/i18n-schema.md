# i18n schema and contract

Reference document for EPIC #108 (i18n locale expansion). All locale FEATs
(Phases 2-5: ar, he, fr, uk) implement against this contract. Hardened by
CHORE #109 (Phase 1).

---

## Dictionary format

Each locale is a flat JSON file at `src/client/i18n/<code>.json`:

```json
{
  "nav.home": "Home",
  "home.hero.headline.1": "Orchestrate.",
  "contact.email": "hello@uzorai.com"
}
```

**Rules:**
- Keys are dot-separated strings (`section.subsection.variant`).
- Values are always plain strings — no interpolation tokens, no nested objects.
- Every locale file must carry **exactly the same key set** as `en.json`.
- New keys added to `en.json` must be added to all other locale files simultaneously (set the value to the English string as a temporary fallback; mark `pending: true` in `src/client/i18n/meta/<code>.json`).

---

## Fallback contract

`LocaleProvider.t()` resolves a key in three ordered tiers — never blank:

```
t(key) = activeDict[key] ?? en[key] ?? key
```

| Tier | Source | When it fires |
|------|--------|---------------|
| 1 | Active locale dict | Key present in the active locale |
| 2 | `en.json` (eagerly bundled) | Key absent from active locale but present in en |
| 3 | Key string itself | Key absent from both active locale and en |

**Implications for locale FEATs:**
- A missing key never causes a blank UI — it silently shows the English string.
- Tier 2 is the designed fallback for `pending: true` keys (see meta files).
- Tier 3 indicates a bug: the key was never added to `en.json`.

---

## Per-string review/version metadata

Metadata lives in a parallel structure at `src/client/i18n/meta/<code>.json`.
It does **not** affect `LocaleProvider` at runtime — it is purely editorial.

```json
{
  "_schema": "1.0",
  "_note": "...",
  "nav.home": { "v": "1.0", "reviewed": "2026-09-04" },
  "home.engine.heading": { "v": "1.0", "reviewed": "2026-09-04", "pending": true }
}
```

| Field | Type | Meaning |
|-------|------|---------|
| `v` | string | Version of the translated string (bumped on retranslation) |
| `reviewed` | ISO date string | Date the string was last reviewed |
| `pending` | boolean (optional) | `true` when the dict value is still the English source string, awaiting localization |

**When adding a new locale (Phase 2+):** create `src/client/i18n/meta/<code>.json`
with all keys. Mark `pending: true` for any key carrying the English fallback value.

---

## Anti-translation guards

UZOR ships first-party i18n. Third-party page translation (Google Translate, etc.)
is actively suppressed at two layers. Both must stay passing — enforced by
`npm test` via `scripts/assert-i18n-guards.mjs`.

**Guard 1 — HTML deny directives** (`src/client/index.html`):
```html
<html lang="en" translate="no">
<meta name="google" content="notranslate" />
```
Prevents Chrome auto-translate and the Google Translate browser extension from
operating on the page.

**Guard 2 — translate.goog canonical-host redirect** (`src/client/index.html`):
```js
if (/\.translate\.goog$/.test(location.hostname)) {
  location.replace('https://uzorai.com' + location.pathname + location.search + location.hash)
}
```
Google's server-side translation proxy re-serves pages under `*.translate.goog`.
This pre-paint redirect sends those visitors back to the canonical host so they
use the in-app language picker. Fires only on `*.translate.goog`; canonical host,
`localhost`, and `*.workers.dev` previews never match.

**Gate for locale FEATs:** before opening a PR for any Phase 2-5 FEAT, run:
```
node scripts/assert-i18n-guards.mjs
```
or simply `npm test`, which calls it. Both guards must pass.

---

## RTL locales (Phase 2: ar, Phase 3: he)

`styles/rtl.css` provides `[dir="rtl"]` layout overrides. `LocaleProvider`
already sets `document.documentElement.dir` from the locale's `dir` field in
`src/client/config/languages.ts`.

**To add an RTL locale:**
1. Add `{ code: 'ar', label: 'العربية', dir: 'rtl' }` to `LANGUAGES` in `languages.ts`.
2. Add `src/client/i18n/ar.json` with all keys from `en.json`.
3. Add `src/client/i18n/meta/ar.json`.
4. Use `test/fixtures/i18n/rtl-fixture.json` as a nav/hero template and reference
   for the minimum key shape.

**To add a pseudo-locale in tests:** import `test/fixtures/i18n/pseudo-locale.json`
as a synthetic active dict and pass it through the `t()` fallback chain.

---

## Adding a new locale (checklist)

- [ ] `src/client/config/languages.ts` — add `{ code, label, dir }` to `LANGUAGES`
- [ ] `src/client/i18n/<code>.json` — all keys from `en.json`; English fallback for untranslated keys
- [ ] `src/client/i18n/meta/<code>.json` — metadata for all keys; `pending: true` on untranslated ones
- [ ] `npm test` green — all AC checks in `test/i18n-locale-contract.test.mjs` pass
- [ ] `scripts/assert-i18n-guards.mjs` passes
