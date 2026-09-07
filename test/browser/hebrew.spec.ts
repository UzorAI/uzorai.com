import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { latinExceptions } from '../helpers/hebrew-allowlist.mjs'

const he = JSON.parse(readFileSync('src/client/i18n/he.json', 'utf8'))
const routes = [...readFileSync('src/client/config/routes.ts', 'utf8').matchAll(/path:\s*'([^']+)'/g)].map(match => match[1]).concat('/missing-page')

async function audit(page: Page, name: string) {
  await expect(page.locator('html')).toHaveAttribute('lang', 'he')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  const snapshot = await page.evaluate(() => {
    const visible = (el: Element) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
    const texts: string[] = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const el = walker.currentNode.parentElement!
      if (visible(el) && !el.closest('script,style,option')) texts.push(walker.currentNode.textContent || '')
    }
    for (const el of document.querySelectorAll('[aria-label],[alt],[title],[placeholder]')) {
      if (visible(el)) for (const attr of ['aria-label', 'alt', 'title', 'placeholder']) texts.push(el.getAttribute(attr) || '')
    }
    for (const el of document.querySelectorAll('body *')) {
      if (visible(el)) for (const pseudo of ['::before', '::after']) {
        const value = getComputedStyle(el, pseudo).content
        if (value && value !== 'none' && value !== 'normal') texts.push(value)
      }
    }
    texts.push(document.title, document.querySelector('meta[name="description"]')?.getAttribute('content') || '')
    const overflow = [...document.querySelectorAll('main *,header *,[role="dialog"] *')].filter(el => {
      if (!visible(el)) return false
      const rect = el.getBoundingClientRect()
      return rect.left < -1 || rect.right > innerWidth + 1
    }).map(el => ({tag: el.tagName, class: el.className, text: el.textContent?.slice(0, 100)}))
    const clipped = [...document.querySelectorAll('.uzor-engine-bricks,.uzor-engine-brick')].filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.className)
    return {texts: texts.filter(t => t.trim()), overflow, clipped, width: innerWidth, scrollWidth: document.documentElement.scrollWidth}
  })
  const unintended = snapshot.texts.filter(text => /[A-Za-z]/.test(text.replace(latinExceptions, '')))
  expect(unintended, `${name}: unintended English`).toEqual([])
  expect(snapshot.overflow, `${name}: elements outside viewport`).toEqual([])
  expect(snapshot.clipped, `${name}: clipped workflow labels`).toEqual([])
  expect(snapshot.scrollWidth, `${name}: page overflow`).toBeLessThanOrEqual(snapshot.width + 1)
  await test.info().attach(name, {body: JSON.stringify(snapshot, null, 2), contentType: 'application/json'})
}

async function drawer(page: Page, width: number) {
  if (width < 1100) await page.getByRole('button', { name: he['nav.openMenu'], exact: true }).click()
}
async function closeDrawer(page: Page, width: number) {
  if (width < 1100) await page.keyboard.press('Escape')
}

for (const host of ['uzorai.com', 'uzor.ai']) {
  for (const width of [1440, 900, 390, 320]) {
    test(`${host} Hebrew routes and interactions at ${width}px`, async ({page, context}) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      await page.setViewportSize({width, height: 900})
      await page.emulateMedia({reducedMotion: 'reduce'})
      await context.addInitScript(() => { localStorage.setItem('uzor-locale', 'he'); localStorage.setItem('uzor-theme', 'dark') })
      // Exercise production assets with the actual host-based hero policy,
      // serving locally through interception. No external service is contacted.
      await page.route('**/*', async route => {
        const url = new URL(route.request().url())
        if (url.hostname !== host) return route.abort()
        const response = await route.fetch({url: `http://127.0.0.1:4173${url.pathname}${url.search}`})
        await route.fulfill({response})
      })
      for (const path of routes) {
        await page.goto(`https://${host}${path}`)
        await expect(page.getByRole('link', {name: he['nav.brandHome'], exact: true})).toBeVisible()
        await audit(page, `${path}-initial`)
        await drawer(page, width)
        await audit(page, `${path}-navigation`)
        const toggle = page.getByRole('button', {name: he['theme.light'], exact: true})
        await toggle.click()
        await expect(page.getByRole('button', {name: he['theme.dark'], exact: true})).toBeVisible()
        await audit(page, `${path}-light`)
        await closeDrawer(page, width)
        if (path === '/') {
          await page.screenshot({path: test.info().outputPath('home-initial.png'), fullPage: true})
        }
        // Release history is reachable on every route, with two detail states.
        await page.getByRole('button', {name: he['footer.deploymentHistory'], exact: true}).click()
        await audit(page, `${path}-history`)
        for (const release of ['020', '010']) {
          await page.getByRole('button', {name: new RegExp(he[`footer.release.${release}.title`])}).click()
          await audit(page, `${path}-release-${release}`)
          if (path === '/' && release === '020') await page.screenshot({path: test.info().outputPath('history-detail.png'), fullPage: true})
          await page.getByRole('button', {name: new RegExp(he['footer.back'])}).click()
        }
        await page.getByRole('button', {name: he['footer.close'], exact: true}).click()
      }
      await page.goto(`https://${host}/`)
      await drawer(page, width)
      await page.getByRole('combobox', {name: he['picker.label']}).selectOption('en')
      await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
      await page.getByRole('combobox', {name: 'Language', exact: true}).selectOption('he')
      await closeDrawer(page, width)
      await audit(page, 'switched-back-to-Hebrew')
      // Link navigation (not just direct loading) keeps the language and closes mobile drawer.
      await drawer(page, width)
      await page.getByRole('link', {name: he['nav.docs'], exact: true}).click()
      await expect(page).toHaveURL(`https://${host}/docs`)
      await audit(page, 'navigation-to-docs')
      await page.goto(`https://${host}/`)
      if (host === 'uzorai.com') {
        await page.clock.install()
        await page.getByRole('button', {name: he['home.engine.sound.toggleToUnmute'], exact: true}).click()
        await audit(page, 'sound-enabled')
        await page.getByRole('button', {name: he['home.engine.sound.toggleToMute'], exact: true}).click()
        await page.getByRole('button', {name: he['home.engine.go.start'], exact: true}).click()
        // Visit every bar, every phase and every canonical stage; preserves timer values.
        for (let bar = 1; bar <= 32; bar++) {
          await page.clock.runFor(2000)
          await audit(page, `demo-bar-${bar}`)
        }
        await expect(page.locator('.uzor-engine-payoff')).toContainText(he['home.engine.artifact.label'])
        await expect(page.locator('.uzor-engine-detail').first()).toContainText('תיבה 32 · פעימה 1 · סיום')
        await page.screenshot({path: test.info().outputPath('home-complete.png'), fullPage: true})
        await page.getByRole('button', {name: he['home.engine.go.start'], exact: true}).click()
        await expect(page.locator('.uzor-engine-payoff')).toHaveCount(0)
        await audit(page, 'demo-restarted')
      }
      expect(errors).toEqual([])
    })
  }
}


test('Hebrew navigator preference renders without a lazy dictionary or English first frame', async ({browser}) => {
  const context = await browser.newContext({locale: 'he-IL'})
  const page = await context.newPage()
  const requests: string[] = []
  await page.addInitScript(() => {
    const frames: string[] = []
    Object.assign(window, {hebrewFrames: frames})
    const observe = () => {
      const root = document.getElementById('root')
      if (root?.textContent) frames.push(root.textContent)
      if (frames.length < 10) requestAnimationFrame(observe)
    }
    requestAnimationFrame(observe)
  })
  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    requests.push(url.pathname)
    if (url.hostname !== 'uzorai.com') return route.abort()
    const response = await route.fetch({url: `http://127.0.0.1:4173${url.pathname}`})
    await route.fulfill({response})
  })
  await page.goto('https://uzorai.com/')
  await expect(page.getByRole('heading', {name: he['home.engine.heading'], exact: true})).toBeVisible()
  await page.waitForFunction(() => (window as unknown as {hebrewFrames: string[]}).hebrewFrames.length >= 10)
  const frames = await page.evaluate(() => (window as unknown as {hebrewFrames: string[]}).hebrewFrames)
  expect(frames.every(frame => frame.includes('מנוע UZOR') && !frame.includes('Implementation and verification'))).toBe(true)
  expect(requests.some(path => /\/he-[^/]+\.js/.test(path))).toBe(false)
  await audit(page, 'navigator-Hebrew')
  await context.close()
})
