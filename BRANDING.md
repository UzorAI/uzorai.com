# LeixAI brand assets

Favicon / icon set derived from the LeixAI mark (mint→teal gradient hexagonal cube).
Transparent background, square, optimized per size.

| File | Size | Use |
|---|---|---|
| `favicon.ico` | 16/32/48 multi-res | Legacy browser tab |
| `favicon-16x16.png` / `favicon-32x32.png` / `favicon-48x48.png` | 16/32/48 | Modern browser tab |
| `apple-touch-icon.png` | 180 | iOS home screen |
| `icon-192.png` | 192 | PWA / Android |
| `icon-512.png` | 512 | PWA maskable · **MCP connector listing logo** |
| `site.webmanifest` | — | Installable metadata |

## Browser tab
Wired in `index.html` `<head>` via `<link rel="icon">`, `apple-touch-icon`, and `manifest`.
Serving these at the web root makes `leixai.com` show the mark in the tab.

## MCP server listing
The ChatGPT Apps / Claude Connectors directory listing logo is `icon-512.png`.
Upload it as the connector logo at submission time (EPIC #206 Phases 3–4).
To also show the mark when an MCP client probes the endpoint, serve `/favicon.ico`
from the `skills.leixai.com` worker (follow-up on the zzv-skills side).

## Regenerating
These were generated from the favicon spec sheet. For pixel-true 512px output,
regenerate from the master `leixai-logo.png` (vector preferred) and re-export the set.
