# Hebrew localization audit — issue #142

PR #143 only loaded Heebo. It was approved by daniel-silvers, merged as
`5db5ce2a419a75120772e97c3f8cd689ac513c6c`, and deployed in the preceding task.
This PR separately completes Hebrew UI localization under existing issue #142.

## Recovery evidence

- Issue #140 implementation: run 34105301497 (workflow sequence 74), success.
- Issue #142 implementation: run 34105324419 (workflow sequence 75), failure.
- Failed job `implw` (101688901557), step 9 `Run implw via claude (subscription mode)`.
- Provider exit 1 after 697 seconds; telemetry `is_error: true`, 50 turns.
- The retained transcript ends: “You've hit your session limit · resets 7:20am (America/New_York)”. Subscription exhaustion caused the failure, not a test failure.
- Original local branch: `htu/uzorai-com-hebrew-locale-untranslated-text-142`, based on `1e335bb`; no new commit, remote branch, or PR.
- Seven uncommitted dictionaries: ar/en/es/fr/he/ru/zh; 107 insertions, 9 deletions. Saved as `/tmp/uzor-142-evidence/partial-implementation.patch` before recovery.
- GitHub artifact: `claude-usage-34105324419-first` (10012808616), telemetry + redacted diagnostic events. The fuller transcript was retained locally, not uploaded by the failed run.
- Failure comment: https://github.com/UzorAI/uzorai.com/issues/142#issuecomment-5568650246
- Recovered useful dictionary additions; removed the unfinished run's unauthorized UZOR transliterations. No workflow rerun and no duplicate font work.

## Scope and source audit

Inspected every client TSX route/component, TS/JS display data and configuration,
JSON dictionary and metadata, both HTML entrypoints, CSS generated content, public
manifest, and the client imports of workflow/performance/experience-pack data.

| Surface | Finding / disposition |
|---|---|
| `/` on demo/development hosts | Engine labels, live announcements, bar/beat/phase, and completed artifact bypassed translation. Now resolve from canonical stage/phase IDs. |
| `/` on production/unknown hosts | Legacy hero copy already translated; image alternative, responsive layout and surrounding shared UI corrected. |
| `/platform`, `/governance`, `/docs`, `/pricing`, `/contact` | Body/card strings already translated. Image alternatives, document title/description, email subject and URL layout corrected. |
| Unknown route | Previously blank main area; now Hebrew not-found title, explanation and home link. |
| Desktop/tablet/mobile navigation | Localized brand-home, open/close and dialog labels; logical borders/margins/insets. |
| Theme button | Localized accessible name and tooltip in both states. |
| Footer/version overlay | Localized every release title/bullet, environment/status label and value, close label; back arrow follows direction; version/date strings isolated. |
| Language picker | Label localized; endonyms deliberately remain in each language's own script so visitors can find their language. |
| Error/empty/loading states | Unknown route added; Hebrew dictionary bundled synchronously (no English loading state). Non-Hebrew loader rejection retains existing English fallback. No forms, accordions or other application dialogs exist. |
| Workflow model, performance manifest | Canonical IDs/order and internal evidence prose unchanged. Every field actually rendered by the demo has a locale key. |
| Vocal/phrase/experience-pack modules | Metadata/future APIs, not imported into rendered UI beyond the existing performance clock; no live caption inventory or audio assets to translate. |
| CSS `content` / public webmanifest | Only empty decorative content; app names are brands. |
| Repository-root `index.html` / branding snippets | Historical static sources, not the Vite entrypoint or Worker asset directory. No Hebrew-mode runtime uses these files. |
| Worker JSON diagnostics, CLI/errors, spec/docs/test prose | Developer/protocol output, not translatable site UI. No identifiers/URLs/commands renamed. |

## New translations and newly localized UI

The key identifies the UI location; all values live in `src/client/i18n/{en,he}.json`.
Dynamic stage labels originate in `workflow/uzorLoopModel.ts`; phase/artifact
metadata originates in `performance/uzorPerformanceManifest.ts`. The component
now resolves their IDs instead of rendering their English prose.

| Key / UI location | English | Hebrew |
|---|---|---|
| `home.engine.stage.authoring.label` | Authoring | יצירה |
| `home.engine.stage.governance.label` | Governance | ממשל |
| `home.engine.stage.implementation-verification.label` | Implementation and verification | יישום ואימות |
| `home.engine.stage.deployment.label` | Deployment | פריסה |
| `home.engine.stage.learning-continuation.label` | Learning and continuation | למידה והמשכיות |
| `home.engine.hud.bar` | Bar | תיבה |
| `home.engine.hud.beat` | Beat | פעימה |
| `home.engine.phase.orientation` | orientation | היכרות |
| `home.engine.phase.construction` | construction | בנייה |
| `home.engine.phase.detail` | detail | פירוט |
| `home.engine.phase.resolution` | resolution | סיום |
| `home.engine.artifact.label` | Representative demo artifact | תוצר הדגמה מייצג |
| `home.engine.artifact.type` | UZOR workflow plan | תוכנית זרימת עבודה של UZOR |
| `home.engine.artifact.model` | model | דגם |
| `nav.brandHome` | UzorAI home | דף הבית של UzorAI |
| `nav.openMenu` | Open menu | פתיחת התפריט |
| `nav.closeMenu` | Close menu | סגירת התפריט |
| `nav.siteNavigation` | Site navigation | ניווט באתר |
| `brand.markAlt` | UzorAI cube mark | סמל הקובייה של UzorAI |
| `theme.light` | Switch to light mode | מעבר למצב בהיר |
| `theme.dark` | Switch to dark mode | מעבר למצב כהה |
| `footer.close` | Close deployment history | סגירת היסטוריית הפריסות |
| `footer.environment` | Environment | סביבה |
| `footer.status` | Status | מצב |
| `footer.environment.production` | production | ייצור |
| `footer.status.success` | success | הושלם בהצלחה |
| `footer.release.020.title` | Deployment History footer + imperative i18n voice | היסטוריית פריסות בכותרת התחתונה וניסוח מניע לפעולה בשפות האתר |
| `footer.release.020.detail.1` | Fixed-bottom version stripe with a clickable Deployment History overlay (htu.io parity) | פס גרסה קבוע בתחתית המסך, הפותח בלחיצה את היסטוריית הפריסות (בהתאמה ל־htu.io) |
| `footer.release.020.detail.2` | Russian hero tagline switched to the informal imperative | הסיסמה הראשית ברוסית עודכנה לפנייה ישירה ולא רשמית |
| `footer.release.020.detail.3` | Hero verbs to imperative, matching each locale's body voice (ru вы, es tú) | הפעלים בכותרת הראשית עודכנו לניסוח מניע לפעולה, בהתאם לסגנון הפנייה בכל שפה |
| `footer.release.020.detail.4` | Hero meaning-strip label routed through t('home.meaning.label') | תווית ההסבר בכותרת הראשית חוברה למערכת התרגום |
| `footer.release.010.title` | Platform scaffold — orchestration marketing site | תשתית הפלטפורמה — אתר השיווק למערכת התזמור |
| `footer.release.010.detail.1` | React 19 + react-router v7 static shell on Cloudflare Workers | מעטפת אתר סטטית המבוססת על React 19 ו־react-router v7, על גבי Cloudflare Workers |
| `footer.release.010.detail.2` | In-house i18n (en/es/ru/zh) with LanguagePicker — third-party translation denied | מערכת תרגום פנימית לאנגלית, ספרדית, רוסית וסינית עם בורר שפה — תרגום חיצוני חסום |
| `footer.release.010.detail.3` | Dark/Light theme toggle with pre-paint persistence (EPIC #29 Phase A) | מעבר בין מצב כהה לבהיר ושמירת ההעדפה לפני הצגת הדף (יוזמה 29, שלב א׳) |
| `footer.release.010.detail.4` | Responsive navigation shell (EPIC #29 Phase C) | תפריט ניווט המותאם לגודל המסך (יוזמה 29, שלב ג׳) |
| `notFound.title` | Page not found | הדף לא נמצא |
| `notFound.body` | The requested page could not be found. | לא הצלחנו למצוא את הדף המבוקש. |
| `notFound.back` | Return home | חזרה לדף הבית |
| `contact.subject` | UzorAI demo request | בקשה להדגמת UzorAI |

The only revised existing Hebrew dictionary value is the deployment detail's
mixed-script punctuation (`ב-Worker` → `ב־Worker`). Bar/beat values remain
numeric (for example `תיבה 32 · פעימה 1 · סיום`); version identifiers are unchanged.
No plural inflection is needed for these singular metric labels.

## Intentional Latin text

| Retained | Reason |
|---|---|
| UZOR, UzorAI, UZOR GO | Product/brand names explicitly permitted by the continuation request; no Hebrew brand spelling established. |
| MCP, Model Context Protocol, OAuth, AI | Protocol names or standard technical acronyms; explanatory language is Hebrew. |
| Worker, Cloudflare Workers, React, react-router | Platform/product/package identifiers in translated release explanations. |
| ZiLin, High Tech United | Proper names in existing brand attribution. |
| htu.io, https://skills.uzorai.com/mcp, hello@uzorai.com | Exact domain, endpoint and contact identifiers. |
| v0.2.0, v0.1.0, v7 and numeric dates/model versions | Technical release/version identifiers; direction isolated where needed. |
| English, Español, Français, and the other language endonyms | Language-picker options intentionally use their own names/scripts. |
| Uzor (webmanifest short_name) | Installed application's brand name. |

## Architecture and RTL

- Hebrew is eagerly imported and selected on the first client render, including stored/navigator preferences. The real translation resolver rejects missing/blank Hebrew keys instead of falling back to English.
- All eight dictionaries retain source-key parity. New untranslated keys in other locales are explicitly `pending: true` per the existing schema; their previous recovered translations are preserved.
- Canonical workflow stage order is unchanged in RTL. Only presentation and labels change.
- The old desktop strip deliberately used nowrap + horizontal scrolling with staircase transforms. It now wraps and removes overlapping offsets; mobile retains an ordered vertical stack. Text is not hidden with overflow clipping.
- Navigation uses logical margins/borders and drawer anchoring. The full bar now collapses below 1100px to accommodate translated labels and controls.
- Long endpoint URLs wrap and stay LTR; release versions/dates use bidi isolation. Legacy hero stacks on mobile. Brand artwork and non-directional controls are not mirrored.
- The report's browser assertions inspect document and element bounds, including workflow-label scroll widths, rather than concealing overflow.

## Verification

See the final verification record below and the `Hebrew localization` CI artifact
`hebrew-localization-evidence`. Browser tests serve the production build locally
under intercepted real host names; this exercises both host-dependent heroes
without deploying or contacting external services.

## Full source/Hebrew dictionary inventory

This includes already-translated strings, so the audit is not restricted to the newly found leaks.

| Key | English source | Hebrew |
|---|---|---|
| `nav.home` | Home | בית |
| `nav.platform` | Platform | פלטפורמה |
| `nav.governance` | Governance | ממשל |
| `nav.docs` | Docs | תיעוד |
| `nav.pricing` | Pricing | תמחור |
| `nav.contact` | Contact | יצירת קשר |
| `header.tagline` | Orchestrate. Govern. Execute. | לתזמר. למשול. לבצע. |
| `picker.label` | Language | שפה |
| `home.eyebrow` | Agent orchestration · Governance · MCP | תזמור סוכנים · ממשל · MCP |
| `home.hero.headline.1` | Orchestrate. | לתזמר. |
| `home.hero.headline.2` | Govern. | למשול. |
| `home.hero.headline.3` | Execute. | לבצע. |
| `home.hero.subhead` | Governed AI orchestration for enterprise agents, tools, and workflows — one woven control plane, auditable end to end. | תזמור AI מבוקר לסוכנים, כלים ותהליכי עבודה ארגוניים — מישור בקרה שזור אחד, הניתן לביקורת מקצה לקצה. |
| `home.cta.demo` | Request demo | בקשת הדגמה |
| `home.cta.docs` | Read the docs | קריאת התיעוד |
| `home.meaning.label` | UZOR · THE PATTERN | UZOR · התבנית |
| `home.meaning.text` | UZOR is the pattern your AI runs on — every agent, tool, and workflow coordinated into one governed, auditable system. For quality, security, and expansion by design, build on ZiLin skills from High Tech United. | UZOR היא התבנית שעליה פועלת הבינה המלאכותית שלכם — כל סוכן, כלי ותהליך עבודה מתואמים למערכת אחת מבוקרת וניתנת לביקורת. לאיכות, לאבטחה ולהתרחבות מתוכננת, בנו על כישורי ZiLin מבית High Tech United. |
| `home.pillars.heading` | One control plane, three jobs | מישור בקרה אחד, שלוש משימות |
| `home.pillar.orchestrate.k` | 01 · Orchestrate | 01 · תזמור |
| `home.pillar.orchestrate.h` | Coordinate every agent | תיאום כל סוכן |
| `home.pillar.orchestrate.p` | Route work across agents, tools, and MCP servers from one place — the lattice that holds the parts together. | ניתוב עבודה בין סוכנים, כלים ושרתי MCP ממקום אחד — הסריג שמחזיק את כל החלקים יחד. |
| `home.pillar.govern.k` | 02 · Govern | 02 · ממשל |
| `home.pillar.govern.h` | Policy at the core | מדיניות בליבה |
| `home.pillar.govern.p` | Identity, permissions, and approval gates enforced before execution. Zero-Trust, audit-ready, host-correct. | זהות, הרשאות ושערי אישור נאכפים לפני הביצוע. אפס אמון, מוכנות לביקורת והתאמה נכונה למארח. |
| `home.pillar.execute.k` | 03 · Execute | 03 · ביצוע |
| `home.pillar.execute.h` | Flow in, results out | קלט זורם, תוצאות יוצאות |
| `home.pillar.execute.p` | Deterministic, verifiable execution with a cryptographic audit trail — every action provable after the fact. | ביצוע דטרמיניסטי וניתן לאימות עם נתיב ביקורת קריפטוגרפי — כל פעולה ניתנת להוכחה בדיעבד. |
| `home.mcp.eyebrow` | Enterprise MCP endpoint | נקודת קצה ארגונית של MCP |
| `home.mcp.heading` | Reachable where your buyers actually are | זמין במקום שבו הקונים שלכם נמצאים באמת |
| `home.mcp.body` | A governed, OAuth-secured MCP server on a clean enterprise domain — no blocked TLDs, no internal brand leakage. | שרת MCP מבוקר ומאובטח ב-OAuth בדומיין ארגוני נקי — ללא סיומות חסומות וללא דליפת מותג פנימי. |
| `home.engine.heading` | The UZOR Engine | מנוע UZOR |
| `home.engine.subhead` | Watch the canonical UZOR Loop build itself, stage by stage, from a cached local demo — no live network, no generation. | צפו בלולאת UZOR הקנונית נבנית שלב אחר שלב מתוך הדגמה מקומית שמורה — ללא רשת חיה וללא יצירה. |
| `home.engine.go.start` | Run UZOR GO | הפעלת UZOR GO |
| `home.engine.go.running` | UZOR GO running… | UZOR GO פועל… |
| `home.engine.sound.stateMuted` | Sound: muted | צליל: מושתק |
| `home.engine.sound.stateUnmuted` | Sound: unmuted | צליל: פעיל |
| `home.engine.sound.toggleToMute` | Mute UZOR GO preview sound | השתקת צליל התצוגה המקדימה של UZOR GO |
| `home.engine.sound.toggleToUnmute` | Unmute UZOR GO preview sound | הפעלת צליל התצוגה המקדימה של UZOR GO |
| `home.engine.bricks.heading` | Canonical build sequence | רצף הבנייה הקנוני |
| `home.engine.status.idle` | Idle — press Run UZOR GO to start the cached demo cycle. | בהמתנה — לחצו על הפעלת UZOR GO כדי להתחיל את מחזור ההדגמה השמור. |
| `home.engine.status.buildingPrefix` | Building: | בבנייה: |
| `home.engine.status.complete` | Cycle complete. | המחזור הושלם. |
| `home.engine.stage.authoring` | Turn intent into a scored spec — deterministic, before anything runs. | הפיכת כוונה למפרט מדורג — באופן דטרמיניסטי, לפני שמשהו פועל. |
| `home.engine.stage.governance` | Gate 1 clears the spec for build — approval logged, not guessed. | שער 1 מאשר את המפרט לבנייה — האישור מתועד, לא מנוחש. |
| `home.engine.stage.implementation-verification` | Code, tests, and build run together — proof before merge. | קוד, בדיקות ובנייה פועלים יחד — הוכחה לפני מיזוג. |
| `home.engine.stage.deployment` | A reviewed change goes live on the one governed Worker. | שינוי שנבדק עולה לאוויר ב־Worker המבוקר היחיד. |
| `home.engine.stage.learning-continuation` | Evidence feeds the next spec — the loop closes and starts again. | הראיות מזינות את המפרט הבא — הלולאה נסגרת ומתחילה מחדש. |
| `home.engine.stage.authoring.label` | Authoring | יצירה |
| `home.engine.stage.governance.label` | Governance | ממשל |
| `home.engine.stage.implementation-verification.label` | Implementation and verification | יישום ואימות |
| `home.engine.stage.deployment.label` | Deployment | פריסה |
| `home.engine.stage.learning-continuation.label` | Learning and continuation | למידה והמשכיות |
| `home.engine.hud.bar` | Bar | תיבה |
| `home.engine.hud.beat` | Beat | פעימה |
| `home.engine.phase.orientation` | orientation | היכרות |
| `home.engine.phase.construction` | construction | בנייה |
| `home.engine.phase.detail` | detail | פירוט |
| `home.engine.phase.resolution` | resolution | סיום |
| `home.engine.artifact.label` | Representative demo artifact | תוצר הדגמה מייצג |
| `home.engine.artifact.type` | UZOR workflow plan | תוכנית זרימת עבודה של UZOR |
| `home.engine.artifact.model` | model | דגם |
| `home.engine.payoff.1` | BUILD SOMETHING BIG WITH UZOR | בנו משהו גדול עם UZOR |
| `home.engine.payoff.2` | SOMETHING YOU COULDN'T BUILD BEFORE | משהו שלא יכולתם לבנות קודם |
| `home.engine.payoff.3` | BECOME BIG | הפכו לגדולים |
| `platform.title` | Platform | פלטפורמה |
| `platform.tagline` | The woven control plane | מישור הבקרה השזור |
| `platform.body` | UzorAI coordinates enterprise agents, tools, and workflows from one governed control plane — orchestration, governance, and execution as a single auditable pattern. | UzorAI מתאמת סוכנים, כלים ותהליכי עבודה ארגוניים ממישור בקרה מבוקר אחד — תזמור, ממשל וביצוע כתבנית אחידה וניתנת לביקורת. |
| `platform.cap.1.h` | One control plane | מישור בקרה אחד |
| `platform.cap.1.p` | Agents, tools, and MCP servers coordinated from a single woven lattice — no fragmented glue code between systems. | סוכנים, כלים ושרתי MCP מתואמים בסריג שזור אחד — ללא קוד תיווך מפוצל בין מערכות. |
| `platform.cap.2.h` | MCP-native | מותאם ל-MCP |
| `platform.cap.2.p` | Speak the Model Context Protocol end to end. Connect enterprise tools and agents through one governed endpoint. | עבודה עם Model Context Protocol מקצה לקצה. חיבור כלים וסוכנים ארגוניים דרך נקודת קצה מבוקרת אחת. |
| `platform.cap.3.h` | Auditable by construction | ניתן לביקורת מעצם התכנון |
| `platform.cap.3.p` | Every routed action carries a verifiable trail, so orchestration stays provable long after it runs. | כל פעולה מנותבת נושאת נתיב ניתן לאימות, כך שהתזמור נשאר ניתן להוכחה זמן רב לאחר ההפעלה. |
| `governance.title` | Governance | ממשל |
| `governance.tagline` | Policy at the core | מדיניות בליבה |
| `governance.body` | Identity, permissions, and approval gates are enforced before execution — Zero-Trust, audit-ready, and host-correct, so orchestration stays accountable end to end. | זהות, הרשאות ושערי אישור נאכפים לפני הביצוע — אפס אמון, מוכנות לביקורת והתאמה נכונה למארח, כדי שהתזמור יישאר אחראי מקצה לקצה. |
| `governance.ctrl.1.h` | Identity & permissions | זהות והרשאות |
| `governance.ctrl.1.p` | Every agent and tool acts under an explicit identity. Permissions are scoped, not assumed. | כל סוכן וכל כלי פועלים תחת זהות מפורשת. ההרשאות מוגדרות בהיקף ואינן מונחות מראש. |
| `governance.ctrl.2.h` | Approval gates | שערי אישור |
| `governance.ctrl.2.p` | Policy is enforced before execution — high-impact actions pause for the gate, not after the fact. | המדיניות נאכפת לפני הביצוע — פעולות בעלות השפעה גבוהה נעצרות בשער, לא לאחר מעשה. |
| `governance.ctrl.3.h` | Zero-Trust, audit-ready | אפס אמון, מוכן לביקורת |
| `governance.ctrl.3.p` | Host-correct by construction, with a cryptographic trail that makes every decision provable. | התאמה נכונה למארח מעצם התכנון, עם נתיב קריפטוגרפי שהופך כל החלטה לניתנת להוכחה. |
| `docs.title` | Docs | תיעוד |
| `docs.tagline` | Connect to the platform | התחברות לפלטפורמה |
| `docs.body` | UzorAI exposes a governed, OAuth-secured MCP server on a clean enterprise domain. Point an MCP client at the endpoint below to connect. | UzorAI מספקת שרת MCP מבוקר ומאובטח ב-OAuth בדומיין ארגוני נקי. הפנו לקוח MCP לנקודת הקצה שלהלן כדי להתחבר. |
| `pricing.title` | Pricing | תמחור |
| `pricing.tagline` | Enterprise, by engagement | לארגונים, לפי התקשרות |
| `pricing.body` | UzorAI is sold as a governed enterprise platform. Pricing is scoped to your agents, tools, and governance requirements — talk to us and we will shape an engagement around the control plane you need. | UzorAI נמכרת כפלטפורמה ארגונית מבוקרת. התמחור מותאם לסוכנים, לכלים ולדרישות הממשל שלכם — דברו איתנו ונעצב התקשרות סביב מישור הבקרה הדרוש לכם. |
| `contact.title` | Contact | יצירת קשר |
| `contact.body` | Ready to see the woven control plane in action? Request a demo and we will walk through orchestration, governance, and execution against your own agents and tools. | מוכנים לראות את מישור הבקרה השזור בפעולה? בקשו הדגמה ונציג תזמור, ממשל וביצוע עם הסוכנים והכלים שלכם. |
| `contact.email` | hello@uzorai.com | hello@uzorai.com |
| `footer.tagline` | UZOR — the pattern beneath orchestration, governance, and execution. | UZOR — התבנית שמתחת לתזמור, לממשל ולביצוע. |
| `footer.deploymentHistory` | Deployment History | היסטוריית פריסות |
| `footer.back` | Back | חזרה |
| `nav.brandHome` | UzorAI home | דף הבית של UzorAI |
| `nav.openMenu` | Open menu | פתיחת התפריט |
| `nav.closeMenu` | Close menu | סגירת התפריט |
| `nav.siteNavigation` | Site navigation | ניווט באתר |
| `brand.markAlt` | UzorAI cube mark | סמל הקובייה של UzorAI |
| `theme.light` | Switch to light mode | מעבר למצב בהיר |
| `theme.dark` | Switch to dark mode | מעבר למצב כהה |
| `footer.close` | Close deployment history | סגירת היסטוריית הפריסות |
| `footer.environment` | Environment | סביבה |
| `footer.status` | Status | מצב |
| `footer.environment.production` | production | ייצור |
| `footer.status.success` | success | הושלם בהצלחה |
| `footer.release.020.title` | Deployment History footer + imperative i18n voice | היסטוריית פריסות בכותרת התחתונה וניסוח מניע לפעולה בשפות האתר |
| `footer.release.020.detail.1` | Fixed-bottom version stripe with a clickable Deployment History overlay (htu.io parity) | פס גרסה קבוע בתחתית המסך, הפותח בלחיצה את היסטוריית הפריסות (בהתאמה ל־htu.io) |
| `footer.release.020.detail.2` | Russian hero tagline switched to the informal imperative | הסיסמה הראשית ברוסית עודכנה לפנייה ישירה ולא רשמית |
| `footer.release.020.detail.3` | Hero verbs to imperative, matching each locale's body voice (ru вы, es tú) | הפעלים בכותרת הראשית עודכנו לניסוח מניע לפעולה, בהתאם לסגנון הפנייה בכל שפה |
| `footer.release.020.detail.4` | Hero meaning-strip label routed through t('home.meaning.label') | תווית ההסבר בכותרת הראשית חוברה למערכת התרגום |
| `footer.release.010.title` | Platform scaffold — orchestration marketing site | תשתית הפלטפורמה — אתר השיווק למערכת התזמור |
| `footer.release.010.detail.1` | React 19 + react-router v7 static shell on Cloudflare Workers | מעטפת אתר סטטית המבוססת על React 19 ו־react-router v7, על גבי Cloudflare Workers |
| `footer.release.010.detail.2` | In-house i18n (en/es/ru/zh) with LanguagePicker — third-party translation denied | מערכת תרגום פנימית לאנגלית, ספרדית, רוסית וסינית עם בורר שפה — תרגום חיצוני חסום |
| `footer.release.010.detail.3` | Dark/Light theme toggle with pre-paint persistence (EPIC #29 Phase A) | מעבר בין מצב כהה לבהיר ושמירת ההעדפה לפני הצגת הדף (יוזמה 29, שלב א׳) |
| `footer.release.010.detail.4` | Responsive navigation shell (EPIC #29 Phase C) | תפריט ניווט המותאם לגודל המסך (יוזמה 29, שלב ג׳) |
| `notFound.title` | Page not found | הדף לא נמצא |
| `notFound.body` | The requested page could not be found. | לא הצלחנו למצוא את הדף המבוקש. |
| `notFound.back` | Return home | חזרה לדף הבית |
| `contact.subject` | UzorAI demo request | בקשה להדגמת UzorAI |
