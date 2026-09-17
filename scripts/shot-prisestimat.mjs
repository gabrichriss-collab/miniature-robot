import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = process.argv[2];
const BASE = "http://localhost:3944";

async function shot(browser, viewport, isMobile, label) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    isMobile,
    hasTouch: isMobile
  });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/prisestimat`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(OUT, `prisestimat-${label}-empty.jpg`),
    type: "jpeg",
    quality: 82,
    fullPage: true
  });

  // Fill in the form using client-side setState is hard, so simulate: click "+ Ny post" and type into the description
  await page.click('text="+ Ny post"');
  await page.waitForTimeout(200);
  await page.fill('input[placeholder="Skriv hva som skal gjøres…"]', "terrasse");
  await page.waitForTimeout(400);
  // Type in mengde
  const qtyInput = page.locator('input[aria-label="Mengde"]').first();
  await qtyInput.fill("36");

  // Add customer info
  await page.fill('input[placeholder="Ditt navn"]', "Kari Nordmann");
  await page.fill('input[placeholder="deg@epost.no"]', "kari@example.no");
  await page.fill('input[placeholder="F.eks. Tilbygg Uglåsvegen"]', "Ny terrasse");

  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUT, `prisestimat-${label}-filled.jpg`),
    type: "jpeg",
    quality: 82,
    fullPage: true
  });

  // Open browse modal
  await page.click('text="Bla i prisliste →"');
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(OUT, `prisestimat-${label}-browse.jpg`),
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
