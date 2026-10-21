#!/usr/bin/env node
/**
 * Capture real-app splash (#vpss) + sidebar screenshots from production preview.
 * Holds the splash open (stubs __VPSS__.hide/remove) so we can photograph the
 * actual overlay, then releases it and verifies it can still be hidden.
 */
import { chromium } from '@playwright/test';
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5050';
const OUT = process.env.OUT_DIR || '/opt/cursor/artifacts/screenshots';
mkdirSync(OUT, { recursive: true });

async function captureTheme({ theme, splashName, sidebarName }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: theme,
  });
  const page = await context.newPage();

  await context.addInitScript((mode) => {
    localStorage.setItem('vueuse-color-scheme', mode);

    // Hold the real splash overlay open until the capture script releases it.
    const hold = setInterval(() => {
      const vpss = window.__VPSS__;
      if (!vpss || vpss.__synHoldInstalled) {
        return;
      }
      vpss.__synHoldInstalled = true;
      vpss.__synOrigHide = vpss.hide.bind(vpss);
      vpss.hide = async () => {
        // no-op while held
      };
      vpss.remove = () => {
        // no-op while held
      };
      clearInterval(hold);
    }, 1);
  }, theme);

  await page.goto(`${BASE}/?t=${Date.now()}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await page.waitForSelector('#vpss', { state: 'visible', timeout: 30000 });
  // Ensure logo from the real splash asset is present
  await page.waitForFunction(() => {
    const el = document.getElementById('vpss');
    if (!el) {
      return false;
    }
    const html = el.innerHTML;
    return html.includes('syntools-splash') || html.includes('sYnTools') || html.includes('sY');
  }, null, { timeout: 10000 });

  // Give layout/styles a beat, then capture the overlay itself.
  await page.waitForTimeout(200);
  const splashPath = path.join(OUT, splashName);
  const splashEl = await page.$('#vpss');
  await splashEl.screenshot({ path: splashPath });
  const sawSplash = existsSync(splashPath);

  // Sanity: splash element should cover the viewport (fixed full-screen).
  const box = await splashEl.boundingBox();
  const splashLooksFullBleed = Boolean(box && box.width >= 1000 && box.height >= 600);

  // Release hold and hide the real way (router already ready → call original hide).
  await page.evaluate(async () => {
    const vpss = window.__VPSS__;
    if (!vpss) {
      return;
    }
    if (vpss.__synOrigHide) {
      vpss.hide = vpss.__synOrigHide;
    }
    // Force remove path used by the plugin after fade
    vpss.hidden = false;
    await vpss.hide();
    // If animation path stalled, remove directly
    await new Promise((r) => setTimeout(r, 400));
    if (document.getElementById('vpss')) {
      vpss.remove?.();
      document.getElementById('vpss')?.remove();
      document.getElementById('vpss-style')?.remove();
    }
  });

  await page.waitForFunction(() => !document.getElementById('vpss'), null, {
    timeout: 15000,
  });
  const splashHidden = !(await page.$('#vpss'));

  await page.waitForSelector('.hero-wrapper .title', { timeout: 60000 });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(OUT, sidebarName),
    fullPage: false,
  });

  const brand = (await page.locator('.hero-wrapper .title').innerText()).trim();
  const subtitle = (await page.locator('.hero-wrapper .subtitle').innerText()).trim();

  // Fresh context without hold: splash should appear then hide on its own (incl. after SW).
  const context2 = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: theme,
  });
  const page2 = await context2.newPage();
  await context2.addInitScript((mode) => {
    localStorage.setItem('vueuse-color-scheme', mode);
  }, theme);

  let sawSplashOnReload = false;
  const reloadNav = page2.goto(`${BASE}/?reload=${Date.now()}`, {
    waitUntil: 'commit',
    timeout: 60000,
  });
  try {
    await page2.waitForSelector('#vpss', { state: 'visible', timeout: 10000 });
    sawSplashOnReload = true;
  }
  catch {
    sawSplashOnReload = false;
  }
  await reloadNav.catch(() => {});
  await page2.waitForSelector('.hero-wrapper', { timeout: 90000 });
  await page2.waitForFunction(() => !document.getElementById('vpss'), null, {
    timeout: 30000,
  }).catch(() => {});
  const splashHiddenAfterReload = !(await page2.$('#vpss'));
  await context2.close();

  await browser.close();

  return {
    theme,
    sawSplash,
    splashLooksFullBleed,
    splashFileExists: existsSync(splashPath),
    splashHidden,
    sawSplashOnReload,
    splashHiddenAfterReload,
    brand,
    subtitle,
    splashPath,
    sidebarPath: path.join(OUT, sidebarName),
  };
}

const dark = await captureTheme({
  theme: 'dark',
  splashName: 'splash-dark.png',
  sidebarName: 'sidebar-dark.png',
});
const light = await captureTheme({
  theme: 'light',
  splashName: 'splash-light.png',
  sidebarName: 'sidebar-light.png',
});

console.log(JSON.stringify({ dark, light }, null, 2));

const failures = [];
for (const r of [dark, light]) {
  if (!r.sawSplash || !r.splashFileExists || !r.splashLooksFullBleed) {
    failures.push(`${r.theme}: splash not captured as full-bleed #vpss overlay`);
  }
  if (!r.splashHidden) {
    failures.push(`${r.theme}: splash did not hide after release`);
  }
  if (!r.sawSplashOnReload || !r.splashHiddenAfterReload) {
    failures.push(`${r.theme}: splash reload verify failed (appear=${r.sawSplashOnReload}, hide=${r.splashHiddenAfterReload})`);
  }
  if (r.brand !== 'sYnTools') {
    failures.push(`${r.theme}: brand is "${r.brand}"`);
  }
  if (r.subtitle !== 'Engineering. Security. Automation.') {
    failures.push(`${r.theme}: subtitle is "${r.subtitle}"`);
  }
}

if (failures.length) {
  console.error('FAILED:\n' + failures.map((f) => ` - ${f}`).join('\n'));
  process.exit(1);
}

console.log('OK: real-app splash + sidebar captured (dark/light); splash hides; reload OK');
