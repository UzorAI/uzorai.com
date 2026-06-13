# UzorAI brand assets

Favicon / icon set derived from the UzorAI cube mark — the hexagonal "узор" cube,
rendered mint (Aqua `#A7E3E5`) on a graphite `#0F172A` tile for the app icon, and
on a transparent background for the browser favicons. The cube is the single
canonical mark; there is no separate or legacy symbol. Master vector:
`branding/uzor-logo.svg` (regenerate the raster kit via `branding/generate-assets.py`).

| File | Size | Use |
|---|---|---|
| `public/favicon/uzor.ico` | 16/32/48 multi-res | Legacy browser tab |
| `public/favicon/uzor-favicon.svg` | vector | Modern browser tab |
| `public/favicon/uzor-16.png` / `uzor-32.png` / `uzor-48.png` / `uzor-128.png` | 16/32/48/128 | Modern browser tab / bookmarks |
| `public/app-icon/uzor-180.png` | 180 | iOS home screen (apple-touch-icon) |
| `public/app-icon/uzor-512.png` | 512 | PWA · **MCP connector listing logo** |
| `public/app-icon/uzor-1024.png` | 1024 | PWA maskable / high-res tile |
| `public/site.webmanifest` | — | Installable metadata |

## Browser tab
Wired in the page `<head>` via `<link rel="icon">`, `apple-touch-icon`, and
`manifest` — see `branding/head-snippet.html`. Serving these at the web root makes
`uzorai.com` show the cube mark in the tab.

## MCP server listing
The ChatGPT Apps / Claude Connectors directory listing logo is the mint-on-graphite
tile `public/app-icon/uzor-512.png`. Upload it as the connector logo at submission
time. To also show the mark when an MCP client probes the endpoint, serve
`/favicon.ico` from the `skills.uzorai.com` worker.

## Regenerating
The raster kit is generated from the cube master. For pixel-true output,
regenerate from `branding/uzor-logo.svg` via `branding/generate-assets.py` and
re-export the set — do not redraw the mark.
