# Uzor — brand assets

Canonical mark + web assets for **Uzor** (product) / **UzorAI** (enterprise form).
Single source of truth: `branding/generate-assets.py` (the mark path is baked in — **do not redraw**).

## Build
```bash
pip install cairosvg pillow --break-system-packages
python branding/generate-assets.py
```
Emits `branding/uzor-logo.svg`, `public/favicon/*` (svg + png 16/32/48/128/512 + ico), `public/app-icon/*` (180/512/1024, Aqua-on-Graphite tile), `branding/avatar/*` (org/social).

## Wiring
Paste `branding/head-snippet.html` into `<head>`; ship `public/site.webmanifest`.

## Domains (one brand, two live front doors)
- **uzorai.com** — canonical / enterprise (Big Corp). MCP: `skills.uzorai.com/mcp`.
- **uzor.ai** — live high-tech / community front door (not a redirect).

## Color (role-bound)
Graphite `#0F172A` · Slate `#1E293B` · Soft White `#F8FAFC` · Teal `#0B6E78` (accent on light, AA) · Aqua `#A7E3E5` (accent on dark only).

Tagline: **Orchestrate. Govern. Execute.** — migrated from LeixAI 2026-06-03; mark, colors, typography, and usage rules unchanged.
