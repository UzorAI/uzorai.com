import { Hono } from 'hono'
import {
  applySecurityHeaders,
  classifyHost,
  healthzBody,
  HEALTHZ_ALLOWED_METHODS,
} from './security'

// Cloudflare static-assets binding (configured in wrangler.toml [assets]).
type Bindings = {
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

const app = new Hono<{ Bindings: Bindings }>()

// Security headers apply to every response this Worker returns, including
// the 404/405 safe responses below and whatever the ASSETS binding serves
// (CHORE #84 §2) — reassigning c.res rewraps the response after next() so a
// streamed asset body still gets the headers without being buffered.
app.use('*', async (c, next) => {
  await next()
  c.res = applySecurityHeaders(c.res)
})

// Never leak an unhandled exception's message/stack to the client.
app.onError((err, c) => {
  console.error(err)
  return c.text('Internal Server Error', 500)
})

// Lightweight liveness probe for the Worker itself — body is the fixed,
// secret-free shape in healthzBody(), never a dump of bindings/env/config.
app.get('/healthz', (c) => c.json(healthzBody()))
app.on(
  ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  '/healthz',
  (c) => {
    c.header('Allow', HEALTHZ_ALLOWED_METHODS.join(', '))
    return c.text('Method Not Allowed', 405)
  },
)

// Everything else is served by the built client, gated by the normalized
// host contract (CHORE #84 §1): only the four bound custom domains select a
// staging/production presentation. An unrecognized/malformed Host — spoofed,
// missing, or a vhost-confusion attempt — gets a safe 404 instead of ever
// reaching the ASSETS binding. The assets binding is configured with
// single-page-application not_found_handling, so deep links on a recognized
// host still fall back to index.html for client-side routing.
app.all('*', (c) => {
  const role = classifyHost(c.req.header('host'))
  if (!role) {
    return c.text('Not Found', 404)
  }
  return c.env.ASSETS.fetch(c.req.raw)
})

export default app
