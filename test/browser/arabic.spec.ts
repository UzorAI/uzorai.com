import { test, expect, type Page, type Route } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { latinExceptions } from '../helpers/hebrew-allowlist.mjs'

const ar = JSON.parse(readFileSync('src/client/i18n/ar.json', 'utf8'))
const routes = [...readFileSync('src/client/config/routes.ts', 'utf8').matchAll(/path:\s*'([^']+)'/g)].map(match => match[1]).concat('/missing-page')

async function fulfillFromPreview(route: Route, url: URL) {
  const response = await fetch(`http://127.0.0.1:4173${url.pathname}${url.search}`)
  // Materialize the response before fulfillment. Passing the live Response can
  // race with Playwright disposing it during parallel navigation requests.
  await route.fulfill({
    status: response.status,
    headers: Object.fromEntries(response.headers),
    body: Buffer.from(await response.arrayBuffer()),
  })
}

async function audit(page: Page, name: string) {
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('link', {name: ar['nav.brandHome'], exact: true})).toBeVisible()
  const texts = await page.locator('body').evaluate(body => {
    const visible = (el: Element) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
    const result: string[] = []
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const node = walker.currentNode
      const parent = node.parentElement
      if (parent && visible(parent) && !parent.closest('script,style,option')) result.push(node.textContent || '')
    }
    for (const el of document.querySelectorAll('[aria-label],[alt],[title],[placeholder]')) {
      if (visible(el)) for (const attr of ['aria-label', 'alt', 'title', 'placeholder']) result.push(el.getAttribute(attr) || '')
    }
    result.push(document.title, document.querySelector('meta[name="description"]')?.getAttribute('content') || '')
    return result.filter(text => text.trim())
  })
  const unintended = texts.filter(text => /[A-Za-z]/.test(text.replace(latinExceptions, '')))
  expect(unintended, `${name}: unintended English`).toEqual([])
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
