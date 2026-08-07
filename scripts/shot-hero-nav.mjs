import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = process.argv[2];
const BASE = "http://localhost:3948";

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  headless: true
});

const viewports = [
  { w: 390, h: 844, label: "mobile", mobile: true },
  { w: 820, h: 1180, label: "tablet", mobile: false },
  { w: 1440, h: 900, label: "desktop", mobile: false }
];

for (const v of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: v.w, height: v.h },
    deviceScaleFactor: 1,
    isMobile: v.mobile,
    hasTouch: v.mobile
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: `${OUT}/hero-${v.label}.jpg`,
    type: "jpeg",
    quality: 82,
    fullPage: false
  });
  await ctx.close();
}

await browser.close();
console.log("done");
