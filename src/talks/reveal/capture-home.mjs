/**
 * Slide 1's still: the live catalog's home page, captured and cropped to its
 * top. It loads the home page in a 1920 by 1080 window at twice the pixels,
 * keeps the nav bar and the hero (headline, description, search box and the
 * two buttons), and stops above the count line under the buttons. The hero's
 * "See all N use cases" link is hidden before the capture, so no count of
 * entries is on the slide. The side margins, where the page is empty, are
 * cut, so the page reads at the size the slide sets it.
 *
 * Playwright is not a dependency of the site; sharp comes with Next. From the
 * repo's root:
 *
 *   npx -y -p playwright@1.63.0 node src/talks/reveal/capture-home.mjs [out]
 *
 * `out` defaults to public/reveal/catalog-home.v1.webp. A changed picture
 * needs a new version in its name (v2, v3 ...), because a still under an old
 * name is served from cache; change STILLS.home in worlds/reveal/layout.ts to
 * match, and keep the crop's 1280 by 570 shape, which the layout's sizes
 * assume.
 */
import { execSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const HOME = "https://big-cities-health-coalition.github.io/use-case-catalog/";
const WINDOW = { width: 1920, height: 1080 };
const SCALE = 2;
/** The crop, in the page's own pixels: the content column with a little margin, from the top down to above the count line. */
const CROP = { x: 320, y: 0, w: 1280, h: 570 };
const out = process.argv[2] ?? "public/reveal/catalog-home.v1.webp";

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const bin = realpathSync(execSync("command -v playwright", { encoding: "utf8" }).trim());
    return import(pathToFileURL(join(dirname(bin), "index.mjs")).href);
  }
}

const { chromium } = await loadPlaywright();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: WINDOW, deviceScaleFactor: SCALE });
await page.goto(HOME, { waitUntil: "networkidle" });
await page.evaluate(() => {
  for (const link of document.querySelectorAll("a")) {
    if (/^See all \d+ use cases?$/.test(link.textContent.trim().replace(/\s+/g, " "))) link.style.visibility = "hidden";
  }
});
await page.waitForTimeout(1500);
const frame = await page.screenshot({ fullPage: false });
await browser.close();

const crop = { left: CROP.x * SCALE, top: CROP.y * SCALE, width: CROP.w * SCALE, height: CROP.h * SCALE };
const info = await sharp(frame).extract(crop).webp({ quality: 85 }).toFile(out);
console.log(`${out}: ${info.width} x ${info.height}, ${Math.round(info.size / 1024)} KB`);
