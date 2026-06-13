import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The client is rooted at src/client so the scaffold stays fully isolated from
// the production static index.html at the repo root (it is never the Vite root,
// so the live Pages deploy is untouched — see wrangler.toml + deploy.yml).
export default defineConfig({
  root: 'src/client',
  plugins: [react()],
  build: {
    // Emitted outside src/ so wrangler's [assets] dir is a clean build artifact.
    outDir: '../../dist/client',
    emptyOutDir: true,
  },
})
