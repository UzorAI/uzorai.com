import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './test/browser',
  timeout: 120_000,
  workers: 2,
  fullyParallel: true,
  use: { browserName: 'chromium', trace: 'retain-on-failure' },
  reporter: [['list'], ['json', { outputFile: 'test-results/hebrew-results.json' }]],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
})
