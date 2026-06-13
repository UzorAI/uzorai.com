import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The client is rooted at src/client so the scaffold stays fully isolated from
// the production static index.html at the repo root (it is never the Vite root,
// so the live Pages deploy is untouched — see wrangler.toml + deploy.yml).
export default defineConfig({
  root: 'src/client',
  // The favicon/app-icon/manifest kit lives at the repo-root public/ dir, but
  // Vite's root is src/client (default publicDir would be src/client/public,
  // which doesn't exist). Point it at the real kit so the cube favicons,
  // app-icons, and site.webmanifest are copied into the build and resolve on
  // the Worker preview (the [assets] binding serves dist/client). Asset sources
  // under public/ are unchanged.
  publicDir: '../../public',
  plugins: [react()],
  build: {
    // Emitted outside src/ so wrangler's [assets] dir is a clean build artifact.
    outDir: '../../dist/client',
    emptyOutDir: true,
  },
})
