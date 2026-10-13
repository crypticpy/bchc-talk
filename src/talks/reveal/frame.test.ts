import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FOOTER, Frame, LOGO, LOGO_WHITE } from "./frame";

const html = (props: Parameters<typeof Frame>[0]) => renderToStaticMarkup(createElement(Frame, props));
const css = readFileSync(join(import.meta.dirname, "frame.css"), "utf8");
/** A rule's declarations in frame.css, by its whole selector (rules are a blank line apart). */
const rule = (selector: string) => css.match(new RegExp(`(?:^|\\n\\n)${selector.replace(/[.]/g, "\\.")}\\s*\\{([^}]*)\\}`))![1];
const px = (body: string, property: string) => Number(body.match(new RegExp(`(?:^|\\s)${property}:\\s*(-?\\d+)px`))![1]);

describe("the reveal's frame", () => {
  it("draws the Austin Public Health logo, the footer and the click's number on a content slide", () => {
    const markup = html({ number: 3, total: 6 });
    expect(markup).toContain(`src="${LOGO.src}"`);
    expect(markup).toContain('alt="Austin Public Health"');
    expect(markup).toContain(`<b>${FOOTER.department}</b> · ${FOOTER.group}`);
    expect(`${FOOTER.department} · ${FOOTER.group}`).toBe("Austin Public Health · AIxPH 2026, Baltimore");
    expect(markup).toMatch(/class="reveal-frame__number">3</);
  });

  it("draws only the white logo on the navy title slide", () => {
    const markup = html({ number: 1, total: 6, ground: "navy" });
    expect(markup).toContain(`src="${LOGO_WHITE}"`);
    expect(markup).not.toContain(LOGO.src);
    expect(markup).not.toContain("reveal-frame__footer");
    expect(markup).not.toContain("reveal-frame__number");
  });

  it("keeps the logo's proportions (1920 by 646) and stays in the stage's 64 px edge, clear of the safe area", () => {
    expect(LOGO.w / LOGO.h).toBeCloseTo(1920 / 646, 1);
    const logo = rule(".reveal-frame__logo");
    expect(px(logo, "top") + LOGO.h).toBeLessThanOrEqual(64);
    const foot = rule(".reveal-frame__footer,\\s*.reveal-frame__number");
    expect(px(foot, "top")).toBeGreaterThanOrEqual(1016);
    expect(px(foot, "top") + px(foot, "line-height")).toBeLessThanOrEqual(1080 - 8);
  });

  it("ends the number short of the window's corner, where the deck's counter and back and forward buttons sit", () => {
    expect(px(rule(".reveal-frame__number"), "right")).toBeGreaterThanOrEqual(250);
  });
});
