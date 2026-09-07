# Security Policy

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities privately via GitHub Security Advisories:

1. Navigate to the [Security Advisories](https://github.com/UzorAI/uzorai.com/security/advisories) page.
2. Click **"Report a vulnerability"**.
3. Describe the issue, steps to reproduce, and potential impact.
4. Include the affected component (Worker, client, CI/CD workflow) and any proof-of-concept if available.

We aim to acknowledge reports within **2 business days** and provide a remediation timeline within **7 business days**.

## Scope

This policy covers all code in `UzorAI/uzorai.com`:

- Cloudflare Worker (`src/server/`)
- React client application (`src/client/`)
- CI/CD workflows (`.github/workflows/`)
- Build scripts and tooling (`scripts/`)

## Disclosure expectations

- We request **90 days** from the date of your initial report before any public disclosure.
- If a fix requires more time, we will communicate a revised timeline with you directly.
- We do not operate a bug bounty program at this time.

## Out of scope

- Vulnerabilities in upstream third-party dependencies not attributable to our usage patterns (report those to the upstream maintainer).
- Issues already publicly disclosed or submitted through public channels.
- Theoretical attacks without a working proof of concept or clear exploitability path.
