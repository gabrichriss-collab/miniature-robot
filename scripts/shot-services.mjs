import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = process.argv[2];
const BASE = "http://localhost:3943";

async function shot(browser, viewport, isMobile, label) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    isMobile,
    hasTouch: isMobile
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Scroll so the services slider is centered in view
  await page.evaluate(() => {
    const section = document.querySelector('[aria-label="Tjenester"]');
    if (section) section.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(700);
  await page.screenshot({
    path: path.join(OUT, `services-${label}-1.jpg`),
    type: "jpeg",
    quality: 82,
    fullPage: false
  });

  // Advance one slide via the arrow button
  await page.click('button[aria-label="Neste tjeneste"]');
  await page.waitForTimeout(900);
  await page.screenshot({
    path: path.join(OUT, `services-${label}-2.jpg`),
    type: "jpeg",
    quality: 82,
    fullPage: false
  });

  await ctx.close();
}

(async () => {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    headless: true
  });

  await shot(browser, { width: 390, height: 844 }, true, "mobile");
  await shot(browser, { width: 1440, height: 900 }, false, "desktop");

  await browser.close();
  console.log("done");
})();
