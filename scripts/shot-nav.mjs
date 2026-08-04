import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = process.argv[2];
const BASE = "http://localhost:3942";

(async () => {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    headless: true
  });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true
  });
  const page = await ctx.newPage();

  // 1. home top — should be light
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(OUT, "nav-1-home-top.jpg"),
    type: "jpeg",
    quality: 82,
    clip: { x: 0, y: 0, width: 390, height: 220 }
  });

  // 2. home scrolled — should flip to dark on light bg
  await page.evaluate(() => window.scrollTo(0, 1600));
  await page.waitForTimeout(700);
  await page.screenshot({
    path: path.join(OUT, "nav-2-home-scrolled.jpg"),
    type: "jpeg",
    quality: 82,
    clip: { x: 0, y: 0, width: 390, height: 220 }
  });

  // 3. menu open — should be light on dark overlay
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.click('button[aria-label="Åpne meny"]');
  await page.waitForTimeout(900);
  await page.screenshot({
    path: path.join(OUT, "nav-3-menu-open.jpg"),
    type: "jpeg",
    quality: 82,
    clip: { x: 0, y: 0, width: 390, height: 220 }
  });

  // 4. non-home page top — should be dark from the start
  await page.goto(`${BASE}/tjenester`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({
    path: path.join(OUT, "nav-4-tjenester-top.jpg"),
    type: "jpeg",
    quality: 82,
    clip: { x: 0, y: 0, width: 390, height: 220 }
  });

  await browser.close();
  console.log("done");
})();
