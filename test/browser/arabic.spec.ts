import { test, expect, type Page, type Route } from '@playwright/test'
import { readFileSync } from 'node:fs'

const ar = JSON.parse(readFileSync('src/client/i18n/ar.json', 'utf8'))
const routes = [...readFileSync('src/client/config/routes.ts', 'utf8').matchAll(/path:\s*'([^']+)'/g)].map(match => match[1]).concat('/missing-page')

async function fulfillFromPreview(route: Route, url: URL) {
  const response = await route.fetch({url: `http://127.0.0.1:4173${url.pathname}${url.search}`})
  // Materialize the response before fulfillment. Passing the live Response can
  // race with Playwright disposing it during parallel navigation requests.
  await route.fulfill({
    status: response.status(),
    headers: response.headers(),
    body: await response.body(),
  })
}

async function audit(page: Page, name: string) {
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('link', {name: ar['nav.brandHome'], exact: true})).toBeVisible()
  await test.info().attach(name, {
    body: JSON.stringify({
      title: await page.title(),
      url: page.url(),
      width: await page.evaluate(() => innerWidth),
      scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth),
    }, null, 2),
    contentType: 'application/json',
  })
}

for (const host of ['uzorai.com', 'uzor.ai']) {
  for (const width of [1440, 900, 390, 320]) {
    test(`${host} Arabic route interception and RTL shell at ${width}px`, async ({page, context}) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      await page.setViewportSize({width, height: 900})
      await page.emulateMedia({reducedMotion: 'reduce'})
      await context.addInitScript(() => {
        localStorage.setItem('uzor-locale', 'ar')
        localStorage.setItem('uzor-theme', 'dark')
      })
      await page.route('**/*', async route => {
        const url = new URL(route.request().url())
        if (url.hostname !== host) return route.abort()
        await fulfillFromPreview(route, url)
      })
      for (const path of routes) {
        await page.goto(`https://${host}${path}`)
        await audit(page, `${path}-ar`)
      }
      expect(errors).toEqual([])
    })
  }
}
