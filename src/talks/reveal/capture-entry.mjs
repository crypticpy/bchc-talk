/**
 * Slide 2's still: one real project's page in the live catalog, "Machine
 * learning record linkage", captured and cropped to its top. It loads the
 * page in a 1920 by 1080 window at twice the pixels and keeps the content
 * column from the eyebrow line (how far along it is, and the department)
 * down past the contact panel: the project's name and summary, the grid of
 * facts (skills, readiness, cost to stand up and the rest), and beside it
 * the contact panel. Two things are changed before the capture:
 *
 * - the contact's email address is taken out of the panel, so no one's
 *   address is on a slide; the panel keeps the name, the role and "Ask in
 *   the open", and closes up under them;
 * - the side panel's "On this page" box is hidden, keeping its place,
 *   because the crop's top would slice through it.
 *
 * It prints where the three places the slide rings sit in the still, in the
 * crop's own (page) pixels, as [x, y, w, h]; ENTRY_PLACES in
 * worlds/reveal/layout.ts holds them. Playwright is not a dependency of the
 * site; sharp comes with Next. From the repo's root:
 *
 *   npx -y -p playwright@1.63.0 node src/talks/reveal/capture-entry.mjs [out]
 *
 * `out` defaults to public/reveal/catalog-entry.v1.webp. A changed picture
 * needs a new version in its name (v2, v3 ...), because a still under an old
 * name is served from cache; change STILLS.entry in worlds/reveal/layout.ts
 * to match, and keep the crop's 1248 by 560 shape, which the layout's sizes
 * assume.
 */
import { execSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const PAGE = "https://big-cities-health-coalition.github.io/use-case-catalog/catalog/machine-learning-record-linkage/";
const WINDOW = { width: 1920, height: 1080 };
const SCALE = 2;
/** The crop, in the page's own pixels: the content column with 16 px to spare each side, from 16 px over the eyebrow line to 20 px under the contact panel. */
const CROP = { x: 336, y: 133, w: 1248, h: 560 };
const out = process.argv[2] ?? "public/reveal/catalog-entry.v1.webp";

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
await page.goto(PAGE, { waitUntil: "networkidle" });
await page.mouse.move(0, 0);
const found = await page.evaluate(() => {
  const heading = (text) => Array.from(document.querySelectorAll("h2")).find((h2) => h2.textContent.trim().toLowerCase() === text);
  const contact = heading("contact").closest("section");
  const email = contact.querySelector('a[href^="mailto:"]');
  if (!email) throw new Error("no email link in the contact panel");
  (email.closest("li") ?? email).style.display = "none";
  heading("on this page").closest("nav, section").style.visibility = "hidden";
  const at = (element) => {
    const box = element.getBoundingClientRect();
    return [box.x, box.y + window.scrollY, box.width, box.height].map((n) => Math.round(n));
  };
  const title = document.querySelector("h1");
  return {
    eyebrow: at(title.previousElementSibling ?? title),
    title: at(title),
    summary: at(title.nextElementSibling),
    facts: at(document.querySelector("dt.fact-label").closest("dl")),
    contact: at(contact),
    left: document.body.innerText.includes("@kingcounty.gov"),
  };
});
await page.waitForTimeout(1500);
const frame = await page.screenshot({ fullPage: false });
await browser.close();

const inCrop = ([x, y, w, h]) => [x - CROP.x, y - CROP.y, w, h];
const places = Object.fromEntries(Object.entries(found).filter(([name]) => name !== "left").map(([name, box]) => [name, inCrop(box)]));
console.log("in the crop", JSON.stringify(places));
const outside = Object.entries(places).filter(([, [x, y, w, h]]) => x < 0 || y < 0 || x + w > CROP.w || y + h > CROP.h);
if (found.left) throw new Error("an email address is still on the page");
if (outside.length) throw new Error(`outside the crop: ${outside.map(([name]) => name).join(", ")}`);

const crop = { left: CROP.x * SCALE, top: CROP.y * SCALE, width: CROP.w * SCALE, height: CROP.h * SCALE };
const info = await sharp(frame).extract(crop).webp({ quality: 85 }).toFile(out);
console.log(`${out}: ${info.width} x ${info.height}, ${Math.round(info.size / 1024)} KB`);
