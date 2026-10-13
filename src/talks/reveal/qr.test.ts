import { readFileSync } from "node:fs";
import { join } from "node:path";
import jsQR from "jsqr";
import { describe, expect, it } from "vitest";
import { CATALOG_URL } from "./script";

/**
 * The last slide's QR code (public/reveal/qr.svg), made once with
 * `npx -y qrcode -o public/reveal/qr.svg -t svg <url>` and served as a
 * file, so nothing is fetched or drawn at run time. Here it is drawn into
 * pixels from its own path and read back with a QR reader, so a code that
 * does not open the catalog fails the build.
 */
const SVG = readFileSync(join(import.meta.dirname, "../../../public/reveal/qr.svg"), "utf8");
const SCALE = 8;

/** The dark modules, as the file draws them: each row a run of strokes one module high, centred on its row (`M x y`, `h n`, `m dx dy`). */
function modules(svg: string) {
  const size = Number(svg.match(/viewBox="0 0 (\d+) \1"/)![1]);
  const d = svg.match(/<path stroke="#000000" d="([^"]+)"/)![1];
  const dark: [number, number][] = [];
  let x = 0;
  let y = 0;
  for (const [, op, args] of d.matchAll(/([MmHh])([^MmHh]+)/g)) {
    const [a, b] = args.trim().split(/[\s,]+/).map(Number);
    if (op === "M") [x, y] = [a, b];
    else if (op === "m") [x, y] = [x + a, y + b];
    else {
      const end = op === "h" ? x + a : a;
      for (let column = x; column < end; column++) dark.push([column, Math.floor(y)]);
      x = end;
    }
  }
  return { size, dark };
}

function pixels(svg: string) {
  const { size, dark } = modules(svg);
  const side = size * SCALE;
  const data = new Uint8ClampedArray(side * side * 4).fill(255);
  for (const [mx, my] of dark)
    for (let py = my * SCALE; py < (my + 1) * SCALE; py++)
      for (let px = mx * SCALE; px < (mx + 1) * SCALE; px++) data.fill(0, (py * side + px) * 4, (py * side + px) * 4 + 3);
  return { data, side };
}

describe("the last slide's QR code", () => {
  it("is a square SVG with a white ground and its quiet zone, drawn in black", () => {
    expect(SVG).toMatch(/<svg [^>]*viewBox="0 0 45 45"/);
    expect(SVG).toContain('<path fill="#ffffff" d="M0 0h45v45H0z"/>');
    const { dark } = modules(SVG);
    expect(dark.length).toBeGreaterThan(300);
    expect(Math.min(...dark.map(([x]) => x))).toBe(4);
    expect(Math.max(...dark.map(([x]) => x))).toBe(40);
  });

  it("opens the catalog: read back with a QR reader, it holds the catalog's address and nothing else", () => {
    const { data, side } = pixels(SVG);
    const code = jsQR(data, side, side);
    expect(code?.data).toBe(CATALOG_URL);
  });

  it("is read by the same reader that fails on a picture with no code in it, so the pass above means something", () => {
    const side = 45 * SCALE;
    expect(jsQR(new Uint8ClampedArray(side * side * 4).fill(255), side, side)).toBeNull();
  });
});
