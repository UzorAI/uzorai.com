#!/usr/bin/env node
/**
 * scripts/assert-no-translate.mjs
 *
 * Build-time guard: FAILS the build if the app document drops the
 * third-party-translation deny directives. UZOR provides translation
 * in-house via the htu.io i18n framework; Google / Chrome / browser
 * page translation is denied (PR #27).
 *
 * Why a build-path guard and not a vitest suite: the deploy workflow
 * (.github/workflows/deploy.yml) runs `npm ci && npm run deploy` → it
 * has NO test step, and a workflow edit to add one can't go through the
 * connector's open_pr (workflow scope). Wiring this into `npm run build`
 * (and exposing it as `npm test`) means CI enforces it on every deploy
 * with no workflow change. Pure Node built-ins — no devDependency.
 *
 * Checked document: src/client/index.html (the Vite entry the Worker
 * serves as dist/client). The dormant legacy root index.html is out of
 * the served path and intentionally not checked.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const docPath = join(here, "..", "src", "client", "index.html");

let html;
try {
  html = readFileSync(docPath, "utf8");
} catch (err) {
  console.error(`\n\u2717 no-translate guard: cannot read ${docPath}\n${err.message}\n`);
  process.exit(1);
}

const checks = [
  {
    name: 'html[translate="no"]',
    re: /<html\b[^>]*\btranslate\s*=\s*"no"/i,
    hint: 'add translate="no" to the <html> tag',
  },
  {
    name: 'meta[name="google"][content="notranslate"]',
    re: /<meta\b(?=[^>]*\bname\s*=\s*"google")(?=[^>]*\bcontent\s*=\s*"notranslate")[^>]*>/i,
    hint: 'add <meta name="google" content="notranslate" />',
  },
];

const failures = checks.filter((c) => !c.re.test(html));

if (failures.length > 0) {
  console.error(
    `\n\u2717 no-translate guard FAILED for src/client/index.html\n` +
      `UZOR is the sole translation provider; third-party translation must stay denied.\n` +
      failures.map((f) => `  - missing ${f.name} \u2014 ${f.hint}`).join("\n") +
      `\n`,
  );
  process.exit(1);
}

console.log(
  "\u2713 no-translate guard passed (translate=\"no\" + google notranslate present)",
);
