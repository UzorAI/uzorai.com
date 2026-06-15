/**
 * Superseded by NavMenu (EPIC #29 Phase C). The responsive bar + drawer in
 * NavMenu.tsx now owns navigation and the route list moved to config/routes.ts.
 * This thin re-export keeps any lingering `import Nav from './components/Nav'`
 * resolving during the transition.
 *
 * @deprecated import NavMenu instead.
 */
export { default } from './NavMenu'
