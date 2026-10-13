/**
 * The reveal's world as a whole: it compiles, its clicks stay inside the
 * house limits, its words are the script's, its colours are the kit's,
 * each slide shows only its own picture (and the catalog's home page, which slide 2
 * carries from slide 1), every story line comes up, and the two marks the
 * brand reserves are where the script puts them.
 */
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { compile } from "@/components/deck/engine/compile";
import { CHAIN, CONTENT_TOP, STAGE, STORY, box, storyKeys, type Box } from "@/components/deck/kit";
import { VENDOR_COLOURS, strayTokens } from "@/components/deck/kit/palette";
import { TAB_H } from "@/components/deck/kit/tab";
import { storyId } from "../steps";
import { compiled, endState, hiddenAt, longestStep, markup, movesOf, nodeOf, nodes, pictureOfKey, pictures, playsOf, steps, text } from "./harness";
import { BUILT, ENTRY, HOME, HOW, OPENING, POST, ROW_ON_STAGE, STILLS, THANK } from "./layout";
import { revealEntry } from "./world";

const shows = (id: string, key: string) => !hiddenAt(endState(id), nodeOf(key));
const bottom = (at: Box) => at.y + at.h;
const inside = (a: Box, b: Box) => a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && bottom(a) <= bottom(b);
const apart = (a: Box, b: Box) => a.x + a.w <= b.x || b.x + b.w <= a.x || bottom(a) <= b.y || bottom(b) <= a.y;

describe("the reveal world", () => {
  it("compiles, with a starting value for everything a step moves", () => {
    expect(() => compile(revealEntry.world)).not.toThrow();
  });

  it("finishes every click within 12 s", () => {
    const late = longestStep(compiled)
      .map((end, i) => ({ step: steps[i].id, end: Math.round(end * 100) / 100 }))
      .filter(({ end }) => end > CHAIN.longest);
    expect(late).toEqual([]);
  });

  it("moves only parts the stage has", () => {
    const onStage = new Set(nodes.map((node) => node.key));
    expect(compiled.keys.filter((key) => !onStage.has(key))).toEqual([]);
  });

  it("puts no words on the stage but the script's On screen lines, story lines and labels", () => {
    const allowed = pictures.flatMap((picture) => [picture.show, ...picture.story, ...picture.steps.flatMap((step) => step.show)]);
    expect(text.length).toBeGreaterThan(20);
    expect(text.filter((words) => !allowed.some((line) => line.includes(words)))).toEqual([]);
  });

  it("uses no approving orange, no passing deep green, no literal colour and no provider colours in its own code", () => {
    const css = readFileSync(new URL("./reveal.css", import.meta.url), "utf8");
    expect(css).not.toMatch(/--dk-(human|pass)\b/);
    expect(css.match(/#[0-9a-f]{3,8}\b/gi) ?? []).toEqual([]);
    expect(css.match(/rgba?\([^)]*\)/g) ?? []).toEqual([]);
    for (const name of readdirSync(import.meta.dirname).filter((file) => /\.(tsx?|css)$/.test(file) && !file.endsWith(".test.ts"))) {
      const source = readFileSync(new URL(`./${name}`, import.meta.url), "utf8");
      expect(strayTokens(source), name).toEqual([]);
      expect(source, name).not.toMatch(VENDOR_COLOURS);
    }
  });

  it("shows only the slide's own picture at each click, and on slide 2 the home page slide 1 brought in", () => {
    const carried = (key: string, step: string) => step === "catalog.play" && pictureOfKey(key) === "title" && (key === HOME.key || key.startsWith(`${HOME.key}.`));
    const seen = steps.map((step, i) => {
      const state = compiled.states[i + 1];
      const own = step.id.split(".")[0];
      const strays = nodes.filter((node) => node.paints && pictureOfKey(node.key) !== own && !carried(node.key, step.id) && !hiddenAt(state, node)).map((node) => node.key);
      return { step: step.id, strays: [...new Set(strays)] };
    });
    expect(seen.filter(({ strays }) => strays.length)).toEqual([]);
  });

  it("sets each slide's story lines on the stage and brings them up inside its click, B after A, both still up at the end", () => {
    const wrong = pictures.flatMap((picture) => {
      const id = `${picture.id}.play`;
      const keys = storyKeys(storyId(picture.id), picture.story.length);
      const tells = keys.map((key) => movesOf(id, key, "yPercent"));
      const problems: string[] = [];
      keys.forEach((key, i) => {
        if (!nodeOf(key)) problems.push(`${key} is not on the stage`);
        if (tells[i].length !== 1) problems.push(`${key} comes up ${tells[i].length} times`);
        else if (hiddenAt(endState(id), nodeOf(key))) problems.push(`${key} is hidden at the end`);
      });
      if (tells.length === 2 && tells[0].length && tells[1].length && tells[1][0].at <= tells[0][0].at) problems.push(`${picture.id}: B comes up before A`);
      return problems;
    });
    expect(wrong).toEqual([]);
  });

  it("shows the live catalog's home page on slide 1 whole: a frame of the crop's own shape, under the credit and above the stage's foot", () => {
    expect(STILLS.home[0].src).toMatch(/\/reveal\/catalog-home\.v\d+\.webp$/);
    expect(Math.abs(HOME.at.h - (HOME.at.w * HOME.crop.h) / HOME.crop.w)).toBeLessThanOrEqual(1);
    expect(HOME.at.y).toBeGreaterThan(OPENING.credit.at.y + OPENING.credit.at.h);
    expect(HOME.at.y + HOME.at.h).toBeLessThanOrEqual(STAGE.h - 96);
    expect(HOME.at.x + HOME.at.w).toBeLessThanOrEqual(STORY.x + STORY.w);
  });

  it("brings the home page up on slide 1 and carries it to the left on slide 2, where the project's page lifts out of it", () => {
    expect(shows("title.play", HOME.key)).toBe(true);
    expect(endState("catalog.play")[HOME.key]).toMatchObject(HOME.small);
    const lifts = movesOf("catalog.play", ENTRY.key, "--s");
    expect(lifts).toHaveLength(1);
    expect(lifts[0].on["--s"]).toBe(1);
    expect(lifts[0].at).toBeGreaterThanOrEqual(movesOf("catalog.play", HOME.key, "--s")[0].at);
    const rings = ENTRY.fields.map((field) => movesOf("catalog.play", field.ring.key, "--d")[0].at);
    expect(rings).toEqual([...rings].sort((a, b) => a - b));
    expect(new Set(rings).size).toBe(3);
  });

  it("shows the live catalog's real project page on slide 2: a frame of the crop's own shape, under the story band, right of the small home page, and not the main deck's sample entry", () => {
    expect(STILLS.entry[0].src).toMatch(/\/reveal\/catalog-entry\.v\d+\.webp$/);
    const { at, crop } = ENTRY;
    const capture = readFileSync(new URL("../../capture-entry.mjs", import.meta.url), "utf8");
    expect(capture).toContain(`w: ${crop.w}, h: ${crop.h} }`);
    expect(Math.abs(at.h - (at.w * crop.h) / crop.w)).toBeLessThanOrEqual(1);
    expect(at.y).toBeGreaterThanOrEqual(CONTENT_TOP.two);
    expect(bottom(at)).toBeLessThanOrEqual(1004);
    expect(at.x + at.w).toBeLessThanOrEqual(STORY.x + STORY.w);
    const smallRight = HOME.at.x + HOME.small["--x"] + HOME.at.w * HOME.small["--s"];
    expect(at.x - smallRight).toBeGreaterThanOrEqual(32);
    const sources = (dir: URL): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? sources(new URL(`${entry.name}/`, dir)) : [readFileSync(new URL(entry.name, dir), "utf8")]));
    expect(sources(new URL("../../", import.meta.url)).filter((source) => source.includes(["catalog-entry", "v4"].join(".")))).toEqual([]);
  });

  it("rings the name and summary, the grid of facts and the contact panel where the capture measured them, each ring and its tab inside the page's frame", () => {
    const { at, crop, places, fields } = ENTRY;
    const scale = at.w / crop.w;
    const onFrame = (place: Box) => box(place.x * scale, place.y * scale, place.w * scale, place.h * scale);
    const frame = box(0, 0, at.w, at.h);
    const ringed = [[places.title, places.summary], [places.facts], [places.contact]];
    expect(fields).toHaveLength(3);
    fields.forEach((field, i) => {
      const ring = field.ring.at;
      for (const place of ringed[i]) expect(inside(onFrame(place), ring), field.ring.key).toBe(true);
      expect(inside(ring, frame), field.ring.key).toBe(true);
      expect(field.tab.at.y >= 0 && field.tab.at.y + TAB_H <= at.h, field.tab.key).toBe(true);
      for (const other of fields.slice(i + 1)) expect(apart(ring, other.ring.at), `${field.ring.key} and ${other.ring.key}`).toBe(true);
    });
  });

  it("sets the person's orange mark only where a person approves: at Approval, on the last of the three steps, and on each change on the record", () => {
    const marks = [...markup.matchAll(/<g class="dk-human" data-build="([^"]+)"/g)].map(([, key]) => key);
    expect(marks.sort()).toEqual([HOW.mark.key, BUILT.mark.key, ...BUILT.commits.map((commit) => commit.approval)].sort());
    expect(markup).not.toMatch(/dk-human__label/);
    const ticks = [...markup.matchAll(/<g class="dk-pass-tick" data-build="([^"]+)"/g)].map(([, key]) => key);
    expect(ticks).toEqual([HOW.tick.key]);
  });

  it("sets slide 3's row across the band, margin to margin, with the person over Approval clear of the story lines", () => {
    expect(ROW_ON_STAGE.x).toBe(STORY.x);
    expect(Math.round(ROW_ON_STAGE.x + ROW_ON_STAGE.w)).toBe(STORY.x + STORY.w);
    expect(ROW_ON_STAGE.y + ROW_ON_STAGE.h).toBeLessThanOrEqual(STAGE.h - 120);
    expect(ROW_ON_STAGE.at(HOW.person.at).y).toBeGreaterThanOrEqual(CONTENT_TOP.two + 32);
  });

  it("lands the mark at Approval before the card goes on to Live", () => {
    const mark = movesOf("how.play", HOW.mark.key, "--d")[0];
    const hops = playsOf("how.play").filter((play) => play.key === "how.row.card" && "x" in play.on);
    expect(hops).toHaveLength(6);
    expect(hops[5].at).toBeGreaterThanOrEqual(mark.at + mark.duration);
  });

  it("gives every agent the process's colour, and fills its ring once it has arrived", () => {
    const agents = [...markup.matchAll(/<g class="dk-agent" data-build="([^"]+)"( data-role="([^"]+)")?/g)].map(([, key, , role]) => ({ key, role }));
    expect(agents.map(({ key }) => key)).toEqual(BUILT.agents.map((agent) => agent.key));
    expect(agents.every(({ role }) => role === "process")).toBe(true);
    for (const { key } of agents) {
      const [ring] = movesOf("built.play", key, "--k");
      const [arrives] = movesOf("built.play", key, "autoAlpha");
      expect(ring.at, key).toBeGreaterThan(arrives.at);
    }
  });

  it("raises the three thank-you cards one at a time, and ends the talk on the address and its QR code", () => {
    const rises = THANK.map((card) => movesOf("thanks.play", card.key, "autoAlpha")[0].at);
    expect(rises).toEqual([...rises].sort((a, b) => a - b));
    expect(new Set(rises).size).toBe(3);
    expect(shows("post.play", POST.address.key)).toBe(true);
    expect(shows("post.play", POST.qr.key)).toBe(true);
    expect(markup).toContain(`src="${POST.qr.src}"`);
  });

  it("sets the QR code about 520 px square, level with the two-line address, and clear of it", () => {
    const { qr, address } = POST;
    const { code } = qr;
    expect(Math.abs(code.w - 520)).toBeLessThanOrEqual(8);
    expect(code.h).toBe(code.w);
    // The image is the code and its 4-module quiet zone, 45 modules across (qr.test.ts).
    expect(qr.at.w).toBeCloseTo((code.w * 45) / 37, 6);
    expect(qr.at.x + qr.at.w / 2).toBe(code.x + code.w / 2);
    expect(qr.at.y + qr.at.h / 2).toBe(code.y + code.h / 2);
    expect(address.lines).toHaveLength(2);
    expect(Math.abs(code.y + code.h / 2 - (address.at.y + address.at.h / 2))).toBeLessThanOrEqual(1);
    expect(code.x).toBeGreaterThanOrEqual(address.at.x + address.at.w + 48);
    expect(code.x + code.w).toBeLessThanOrEqual(STORY.x + STORY.w);
    expect(code.y).toBeGreaterThanOrEqual(CONTENT_TOP.one);
    expect(code.y + code.h).toBeLessThanOrEqual(STAGE.h - 112);
  });

  it("names no company with a logo but Austin Public Health", () => {
    const images = [...markup.matchAll(/<img [^>]*src="([^"]+)"/g)].map(([, src]) => src);
    expect(images.filter((src) => !/reveal\/catalog-(home|entry)|aph-logo|\/reveal\/qr\.svg/.test(src))).toEqual([]);
  });
});
