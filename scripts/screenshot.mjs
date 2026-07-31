import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = process.argv[2];
const BASE = process.env.BASE_URL || "http://localhost:3941";

const pages = [
  { slug: "home", path: "/" },
  { slug: "tjenester", path: "/tjenester" },
  { slug: "prosjekter", path: "/prosjekter" },
  { slug: "om-oss", path: "/om-oss" },
  { slug: "baerekraft", path: "/baerekraft" },
  { slug: "karriere", path: "/karriere" },
  { slug: "kontakt", path: "/kontakt" },
  { slug: "personvern", path: "/personvern" }
];

async function shoot(browser, ctxOpts, suffix) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();

  for (const p of pages) {
    await page.goto(`${BASE}${p.path}`, { waitUntil: "networkidle" });
    // Let ken-burns + rise animations settle
    await page.waitForTimeout(1200);
    const out = path.join(OUT, `${p.slug}-${suffix}.png`);
    await page.screenshot({ path: out, fullPage: true });
    console.log("→", out);
  }

  // Hamburger overlay open — home + desktop only
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.click('button[aria-label="Åpne meny"]');
  await page.waitForTimeout(900);
  const out = path.join(OUT, `menu-open-${suffix}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log("→", out);

  await ctx.close();
}

(async () => {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    headless: true
  });

  await shoot(
    browser,
    { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    "desktop"
  );
  await shoot(
    browser,
    {
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    },
    "mobile"
  );

  await browser.close();
})();
