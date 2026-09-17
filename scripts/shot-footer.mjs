import { chromium } from "playwright";
const OUT = process.argv[2];

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  headless: true
});

const viewports = [
  { w: 390, h: 844, label: "mobile", mobile: true },
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
  await page.goto("http://localhost:3945/", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await page.screenshot({
    path: `${OUT}/footer-${v.label}.jpg`,
    type: "jpeg",
    quality: 82,
    fullPage: false
  });
  await ctx.close();
}

await browser.close();
console.log("done");
