import { mkdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const URL_TO_CAPTURE = process.env.CAPTURE_URL
const OUTPUT_DIR = process.env.CAPTURE_DIR
const PLAYWRIGHT_RUNTIME = process.env.PLAYWRIGHT_RUNTIME
  || join(process.env.HOME, '.local/share/omgithub-playwright')

if (!URL_TO_CAPTURE || !OUTPUT_DIR) {
  console.error('Set CAPTURE_URL and CAPTURE_DIR.')
  process.exit(1)
}

const started = Date.now()
const elapsed = () => `${Date.now() - started}ms`
const log = (message) => console.log(`[capture] ${message} (+${elapsed()})`)

async function timed(label, fn) {
  const commandStarted = Date.now()
  log(`${label}: begin`)
  try {
    const result = await fn()
    log(`${label}: end (+${Math.max(0, Date.now() - commandStarted)}ms)`)
    return result
  } catch (error) {
    log(`${label}: failed after ${Math.max(0, Date.now() - commandStarted)}ms`)
    throw error
  }
}

function transient(message, cause) {
  return Object.assign(new Error(message, cause ? { cause } : undefined), { exitCode: 75 })
}
function defect(message, cause) {
  return Object.assign(new Error(message, cause ? { cause } : undefined), { exitCode: 1 })
}
function asTransient(error) {
  if (error.exitCode) return error
  return transient(error.message, error)
}

const require = createRequire(join(PLAYWRIGHT_RUNTIME, 'package.json'))
const { chromium } = require('playwright')

let launchOptions = {}
try {
  const configPath = join(PLAYWRIGHT_RUNTIME, process.platform === 'darwin' ? 'metal.json' : 'linux.json')
  launchOptions = JSON.parse(readFileSync(configPath, 'utf8')).browser?.launchOptions || {}
} catch (error) {
  log(`Playwright config unavailable, using defaults: ${error.message}`)
  launchOptions = { headless: true }
}

if (process.platform === 'linux' && !process.env.DISPLAY && !launchOptions.headless) {
  try {
    process.env.DISPLAY = `:${readFileSync(join(PLAYWRIGHT_RUNTIME, 'display'), 'utf8').trim()}`
  } catch { /* leave DISPLAY unset; launch below reports the failure */ }
}

mkdirSync(OUTPUT_DIR, { recursive: true })
log(`opening ${URL_TO_CAPTURE}`)

let browser
let exitCode = 0
try {
  browser = await timed('launch browser', () => chromium.launch({ ...launchOptions, timeout: 30000 }))
    .catch(error => { throw asTransient(error) })

  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const view = `${name} ${width}x${height}`
    const viewStarted = Date.now()
    const context = await timed(`${view}: new context`, () => browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 }))
      .catch(error => { throw asTransient(error) })
    const page = await timed(`${view}: new page`, () => context.newPage())
      .catch(error => { throw asTransient(error) })
    page.setDefaultTimeout(120000)
    const pageErrors = []
    page.on('pageerror', error => {
      pageErrors.push(error.message)
      console.error(`[capture] ${view} page error: ${error.message}`)
    })

    const response = await timed(`${view}: navigate`, () => page.goto(URL_TO_CAPTURE, { waitUntil: 'domcontentloaded', timeout: 90000 }))
      .catch(error => { throw asTransient(error) })
    if (!response) throw transient(`${view}: navigation returned no response`)
    const status = response.status()
    if ([408, 429, 500, 502, 503, 504].includes(status)) {
      throw transient(`${view}: temporary HTTP ${status}`)
    }
    if (!response.ok()) throw defect(`${view}: HTTP ${status}`)
    log(`${view}: HTTP ${status}`)

    await timed(`${view}: wait for document`, () => page.waitForFunction(() => document.readyState !== 'loading', { timeout: 120000 }))
      .catch(error => { throw asTransient(error) })
    await timed(`${view}: wait for fonts`, () => page.waitForFunction(() => document.fonts?.status === 'loaded', { timeout: 120000 }))
      .catch(error => { throw asTransient(error) })

    await timed(`${view}: wait for canvas`, () => page.waitForSelector('canvas', { state: 'visible', timeout: 120000 }))
      .catch(error => { throw defect(`${view}: game canvas did not render`, error) })
    await timed(`${view}: wait for UI`, () => page.waitForSelector('#ir-ui', { state: 'attached', timeout: 120000 }))
      .catch(error => { throw defect(`${view}: UI overlay did not render`, error) })
    await timed(`${view}: settle`, () => page.waitForTimeout(1200))

    if (pageErrors.length) throw defect(`${view}: page errors: ${pageErrors.join(' | ')}`)
    const output = join(OUTPUT_DIR, `final-${name}.png`)
    await timed(`${view}: screenshot`, () => page.screenshot({ path: output, timeout: 60000 }))
      .catch(error => { throw asTransient(error) })
    log(`${view}: wrote ${output} in ${Date.now() - viewStarted}ms`)
    await timed(`${view}: close page`, () => page.close()).catch(() => {})
    await timed(`${view}: close context`, () => context.close()).catch(() => {})
  }
} catch (error) {
  exitCode = error.exitCode || 1
  console.error(`[capture] ${error.message}`)
} finally {
  if (browser) {
    await timed('close browser', () => browser.close()).catch(error => {
      console.error(`[capture] close failed: ${error.message}`)
      if (!exitCode) exitCode = 75
    })
  }
}

if (exitCode) {
  console.error(`[capture] failed with exit code ${exitCode} after ${elapsed()}`)
  process.exit(exitCode)
}
log('capture complete')
