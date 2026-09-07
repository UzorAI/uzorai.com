import { test, expect, type Page, type Route } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { LANGUAGES, dirFor, type LocaleCode } from '../../src/client/config/languages'

const routes = [...readFileSync('src/client/config/routes.ts', 'utf8').matchAll(/path:\s*'([^']+)'/g)]
  .map(match => match[1])
  .concat('/missing-page')

const dictionaries = Object.fromEntries(
  LANGUAGES.map(({ code }) => [code, JSON.parse(readFileSync(`src/client/i18n/${code}.json`, 'utf8')) as Record<string, string>]),
) as Record<LocaleCode, Record<string, string>>

async function fulfillFromPreview(route: Route, url: URL) {
  const response = await fetch(`http://127.0.0.1:4173${url.pathname}${url.search}`)
  await route.fulfill({
    status: response.status,
    headers: Object.fromEntries(response.headers),
    body: Buffer.from(await response.arrayBuffer()),
  })
}

async function audit(page: Page, locale: LocaleCode, name: string) {
  const dictionary = dictionaries[locale]
  await expect(page.locator('html')).toHaveAttribute('lang', locale)
  await expect(page.locator('html')).toHaveAttribute('dir', dirFor(locale))
  await expect(page.getByRole('link', { name: dictionary['nav.brandHome'], exact: true })).toBeVisible()

  const layout = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    errors: [...document.querySelectorAll('[role="alert"]')].map(el => el.textContent?.trim()).filter(Boolean),
  }))
  expect(layout.errors, `${name}: visible error alerts`).toEqual([])
  expect(layout.scrollWidth, `${name}: page overflow`).toBeLessThanOrEqual(layout.width + 1)
  await test.info().attach(name, { body: JSON.stringify(layout, null, 2), contentType: 'application/json' })
}

for (const { code: locale } of LANGUAGES) {
  for (const host of ['uzorai.com', 'uzor.ai']) {
    for (const width of [1440, 390]) {
      test(`${host} ${locale} language browser smoke at ${width}px`, async ({ page, context }) => {
        const errors: string[] = []
        page.on('pageerror', error => errors.push(error.message))
        await page.setViewportSize({ width, height: 900 })
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await context.addInitScript((selectedLocale) => {
          localStorage.setItem('uzor-locale', selectedLocale)
          localStorage.setItem('uzor-theme', 'dark')
        }, locale)
        await page.route('**/*', async route => {
          const url = new URL(route.request().url())
          if (url.hostname !== host) return route.abort()
          await fulfillFromPreview(route, url)
        })

        for (const path of routes) {
          await page.goto(`https://${host}${path}`)
          await audit(page, locale, `${locale}-${path || 'home'}`)
        }

        await page.goto(`https://${host}/`)
        const dictionary = dictionaries[locale]
        if (width < 1100) {
          await page.getByRole('button', { name: dictionary['nav.openMenu'], exact: true }).click()
        }
        await page.getByRole('combobox', { name: dictionary['picker.label'] }).selectOption('en')
        await expect(page.locator('html')).toHaveAttribute('lang', 'en')
        await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption(locale)
        await audit(page, locale, `${locale}-language-roundtrip`)
        expect(errors, `${locale} ${host}: page errors`).toEqual([])
      })
    }
  }
}
