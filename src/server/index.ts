import { Hono } from 'hono'

// Cloudflare static-assets binding (configured in wrangler.toml [assets]).
type Bindings = {
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

const app = new Hono<{ Bindings: Bindings }>()

// Lightweight liveness probe for the Worker itself.
app.get('/healthz', (c) => c.json({ ok: true, service: 'uzorai' }))

// Everything else is served by the built client. The assets binding is
// configured with single-page-application not_found_handling, so deep links
// fall back to index.html for client-side routing.
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default app
