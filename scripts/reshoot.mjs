import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = process.argv[2];
const BASE = "http://localhost:3941";

const targets = [
  { slug: "home-mobile", path: "/" },
  { slug: "tjenester-mobile", path: "/tjenester" },
  { slug: "prosjekter-mobile", path: "/prosjekter" }
];

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

  for (const t of targets) {
    await page.goto(`${BASE}${t.path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const out = path.join(OUT, `${t.slug}.jpg`);
    await page.screenshot({ path: out, type: "jpeg", quality: 78, fullPage: true });
    console.log("→", out);
  }

  await browser.close();
})();
