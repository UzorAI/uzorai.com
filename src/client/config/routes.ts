import { createElement, type ReactElement } from 'react'
import Home from '../routes/Home'
import Platform from '../routes/Platform'
import Governance from '../routes/Governance'
import Docs from '../routes/Docs'
import Pricing from '../routes/Pricing'
import Contact from '../routes/Contact'

/*
 * Shared route config — the single source of truth consumed by BOTH the router
 * (App.tsx maps these into <Route> elements) and the nav (NavMenu maps the same
 * list into <NavLink>s). One list means the nav and the router can never drift.
 *
 * Game-Theory mitigation (EPIC #29 Phase C): every nav entry is a compile-time
 * member of this typed array — no runtime/user data can inject an arbitrary
 * link, and any path not listed here falls through to the router's 404.
 *
 * `element` is built with createElement (not JSX) so this stays a `.ts` config
 * module; each is a genuine React element ready to hand to <Route element>.
 */
export interface AppRoute {
  /** URL path; also the NavLink target. */
  path: string
  /** i18n key resolved through the active dictionary (fallback en). */
  labelKey: string
  /** Exact-match the active state — only '/' needs it, so the home link isn't
   *  marked active on every nested route. */
  end?: boolean
  /** The routed view, ready for <Route element={...} />. */
  element: ReactElement
}

export const ROUTES: readonly AppRoute[] = [
  { path: '/', labelKey: 'nav.home', end: true, element: createElement(Home) },
  {
    path: '/platform',
    labelKey: 'nav.platform',
    element: createElement(Platform),
  },
  {
    path: '/governance',
    labelKey: 'nav.governance',
    element: createElement(Governance),
  },
  { path: '/docs', labelKey: 'nav.docs', element: createElement(Docs) },
  { path: '/pricing', labelKey: 'nav.pricing', element: createElement(Pricing) },
  { path: '/contact', labelKey: 'nav.contact', element: createElement(Contact) },
] as const
