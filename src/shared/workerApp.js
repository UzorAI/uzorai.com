/**
 * The Worker's Hono app (EPIC #82 child: Worker/Browser Boundary
 * Hardening). Plain JS, factored out of src/server/index.ts (which
 * re-exports `app` verbatim as the Worker entrypoint) so
 * scripts/security/assert-worker-boundary.mjs can construct and exercise
 * the *real* app object with plain Node — no Workers runtime, no test
 * framework, no reimplementation that could drift from what ships.
 */
import { Hono } from 'hono'
import { normalizeHost } from './hostAllowlist.js'
import { SECURITY_HEADERS } from './securityHeaders.js'

const ALLOWED_METHODS = ['GET', 'HEAD']

/**
 * Merge the security headers onto an arbitrary Response, preserving status,
 * statusText, and (streaming-safe) body. Used instead of c.header() queuing
 * because Hono only merges queued headers onto responses it builds itself
 * (c.text/c.json/etc) — a Response returned directly by a handler (e.g. the
 * ASSETS binding's fetch()) bypasses that merge, which would otherwise ship
 * un-hardened responses for exactly the path that serves the most traffic.
 * @param {Response} response
 * @returns {Response}
 */
function withSecurityHeaders(response) {
  const headers = new Headers(response.headers)
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * @returns {Hono} a fresh app instance — a factory rather than a shared
 *   singleton, so tests never leak state across requests.
 */
export function createApp() {
  const app = new Hono()

  // Security headers apply to every response this Worker returns, including
  // the rejections and errors below and whatever the ASSETS binding hands
  // back. try/finally guarantees the rewrite runs whether the chain below
  // returns normally or a handler throws (onError still resolves first;
  // this always runs last), so it's a single choke point for every exit
  // path rather than one call site per handler.
  app.use('*', async (c, next) => {
    try {
      await next()
    } finally {
      if (c.res) c.res = withSecurityHeaders(c.res)
    }
  })

  // Host allowlist: exact-match the four approved presentation hosts (EPIC
  // #82). Anything else fails closed with a bounded 404 — never a redirect,
  // so a spoofed/attacker-controlled Host header can't be bounced anywhere.
  app.use('*', async (c, next) => {
    const host = normalizeHost(c.req.header('host'))
    if (!host) {
      return c.text('Not Found', 404)
    }
    await next()
  })

  app.on(ALLOWED_METHODS, '/healthz', (c) => c.json({ ok: true, service: 'uzorai' }))

  // Everything else is served by the built client. The assets binding is
  // configured with single-page-application not_found_handling, so deep
  // links fall back to index.html for client-side routing.
  app.on(ALLOWED_METHODS, '*', (c) => c.env.ASSETS.fetch(c.req.raw))

  // Any method beyond GET/HEAD is unsupported for this static-asset Worker
  // — fail bounded rather than falling through to the assets binding, which
  // would otherwise happily serve GET content for a POST/PUT/DELETE too.
  app.all('*', (c) => c.text('Method Not Allowed', 405))

  // Bounded, generic error responses: never leak a stack trace, binding,
  // token, or internal path back to the caller. Real detail goes to the
  // Worker's own console (Cloudflare-side logs), never the HTTP response.
  app.onError((err, c) => {
    console.error(err)
    return c.text('Internal Server Error', 500)
  })

  return app
}

export default createApp()
