// Worker entrypoint. All routing/host/method/error/security-header logic
// lives in ../shared/workerApp.js (plain JS) so it can be regression-tested
// directly with Node — see scripts/security/assert-worker-boundary.mjs —
// without a TypeScript build step or the Workers runtime. This file just
// re-exports the real app object verbatim; nothing here can drift from what
// the tests exercise.
import app from '../shared/workerApp'

export default app
