import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ADDRESS, CATALOG_URL, PARTS, SCRIPT, WORLDS } from "./index";
import type { Picture } from "./index";

/**
 * The approved script (docs/reveal-script.md), read from its document the
 * way a person reads it: the single source of every word on the stage and
 * in the notes. A part is a `## Part N. Name (about M minutes)` heading, a
 * picture a `### N. Name` heading under it. Its On screen line is the
 * title, and the bullets under it are the story lines, A then B. Its They
 * see is a paragraph; an indented `Labels:` line lists labels its click
 * puts on the stage, with " / " between them.
 */
function approved() {
  const text = readFileSync(join(import.meta.dirname, "../../../../docs/reveal-script.md"), "utf8");
  const parts: string[] = [];
  const pictures: { part: number; number: string; name: string; show?: string; say?: string; see: string[]; story: string[]; labels: string[] }[] = [];
  let part = 0;
  let field = "";
  for (const line of text.split("\n")) {
    const partHeading = line.match(/^## Part (\d)\. (.*) \(about \d+ minutes\)$/);
    if (line.startsWith("## ")) {
      part = partHeading ? Number(partHeading[1]) : 0;
      if (partHeading) parts.push(partHeading[2]);
      field = "";
    }
    const heading = line.match(/^### (\d+)\. (.*)$/);
    if (part && heading) {
      pictures.push({ part, number: heading[1], name: heading[2], see: [], story: [], labels: [] });
      field = "";
      continue;
    }
    const picture = pictures[pictures.length - 1];
    if (!part || !picture) continue;
    const opens = line.match(/^\*\*(On screen|You say|They see):\*\*\s*(.*)$/);
    const bullet = line.match(/^- (.*)$/);
    const labels = line.match(/^\s+Labels: (.*)$/);
    if (opens) {
      field = opens[1];
      if (field === "On screen") picture.show = opens[2];
      else if (field === "You say") picture.say = opens[2];
      else if (opens[2]) picture.see.push(opens[2]);
    } else if (field === "On screen" && bullet) picture.story.push(bullet[1]);
    else if (field === "They see" && labels) picture.labels.push(...labels[1].split(" / "));
  }
  return { parts, pictures };
}
const SOURCE = approved();

/** The pictures and their clicks, in the order shown: one click a picture, `play`. */
const PLAN: [string, string[]][] = [
  ["title", ["play"]],
  ["catalog", ["play"]],
  ["how", ["play"]],
  ["built", ["play"]],
  ["thanks", ["play"]],
  ["post", ["play"]],
];
/** Which world each part is drawn in: the reveal is one world. */
const WORLD_OF_PART = ["reveal"];

const labels = SCRIPT.flatMap((picture) => picture.steps.flatMap((step) => step.show));
// Every string the audience reads.
const onScreenIn = (picture: Picture) => [picture.show, ...picture.story, ...picture.steps.flatMap((step) => step.show)];
const onScreen = SCRIPT.flatMap(onScreenIn);
// Those, and what the presenter says.
const voiced = SCRIPT.flatMap((picture) => [...onScreenIn(picture), picture.say]);
// Those, plus the script's headings and its They see.
const everything = [...voiced, ...SCRIPT.flatMap((picture) => [picture.name, ...picture.see])];

/** Labels that are not a run of their picture's words: the catalog's address. */
const OFF_SCRIPT = [ADDRESS];

/** Labels allowed past 60 characters: the thank-you cards' lines, set on several rows inside their cards. */
const LONG_LABEL = ["For hosting this workshop, and for helping the coalition get set up on GitHub.", "For the idea, the push to launch, and the Data Modernization Work Group."];

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const BANNED = /\b(leverag\w*|seamless\w*|delv\w*|tapestry|robust|game[- ]chang\w*|cutting[- ]edge|unlock\w*|empower\w*)\b/i;
const FORMAT_WORDS = /powerpoint|slide deck|slideshow/i;
const BRITISH = /\b(colour\w*|prioritis\w*|organis\w*|recognis\w*|licences?|modell\w+|centre\w*|catalogue\w*|whilst|towards)\b/i;
const TIRED = /\bjourney\w*|at the end of the day|\bsimply\b|!/i;
// A lone digit from 2 to 9. Digits inside larger numbers (27, 1,283) are not lone.
const LONE_DIGIT = /(?<![\d,.])[2-9](?![\d,.])/;

describe("the reveal's script", () => {
  it("is the approved script, word for word: every picture's heading, On screen, story lines, You say and They see", () => {
    expect(SOURCE.pictures).toHaveLength(6);
    expect(SCRIPT.map(({ part, number, name, show, story, say, see }) => ({ part, number, name, show, story, say, see }))).toEqual(
      SOURCE.pictures.map(({ part, number, name, show, story, say, see }) => ({ part, number, name, show, story, say, see })),
    );
  });

  it("names its parts as the script heads them", () => {
    expect(PARTS).toEqual(SOURCE.parts);
  });

  it("puts every label the script lists on its picture's click, in the script's order", () => {
    const listing = SOURCE.pictures.filter((picture) => picture.labels.length);
    expect(listing.map((picture) => picture.number)).toEqual(["1", "2", "3", "4", "5"]);
    for (const { number, labels } of listing) {
      const picture = SCRIPT.find((entry) => entry.number === number)!;
      const shown = picture.steps.flatMap((step) => step.show);
      expect(shown.filter((label) => labels.includes(label)).sort((a, b) => labels.indexOf(a) - labels.indexOf(b)), `slide ${number}`).toEqual(labels);
    }
  });

  it("uses the plan's picture ids and step ids, in the plan's order", () => {
    expect(SCRIPT.map((picture) => [picture.id, picture.steps.map((step) => step.id)])).toEqual(PLAN);
  });

  it("gives every picture a unique id in kebab case, since ids are used in the address", () => {
    const ids = SCRIPT.map((picture) => picture.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(KEBAB);
    for (const picture of SCRIPT) for (const step of picture.steps) expect(step.id).toMatch(KEBAB);
  });

  it("numbers its pictures 1 to 6 and runs them in one part", () => {
    expect(SCRIPT.map((picture) => picture.number)).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect([...new Set(SCRIPT.map((picture) => picture.part))]).toEqual(PARTS.map((_, index) => index + 1));
  });

  it("sets every picture in its part's world, and every world holds a picture", () => {
    expect([...WORLDS]).toEqual([...new Set(WORLD_OF_PART)]);
    for (const picture of SCRIPT) expect(picture.world, picture.id).toBe(WORLD_OF_PART[picture.part - 1]);
  });

  it("gives every picture one click: six in all", () => {
    for (const picture of SCRIPT) expect(picture.steps.length, picture.id).toBe(1);
    expect(SCRIPT.flatMap((picture) => picture.steps)).toHaveLength(6);
  });

  it("leaves no string empty", () => {
    for (const text of everything) expect(text.trim()).not.toBe("");
  });

  it("uses no em or en dashes", () => {
    for (const text of everything) expect(text).not.toMatch(/[–—]/);
  });

  it("keeps the words we avoid, and the format's name, out of what is shown and said", () => {
    for (const text of voiced) {
      expect(text).not.toMatch(BANNED);
      expect(text).not.toMatch(FORMAT_WORDS);
    }
  });

  it("uses American spelling in what is shown and said", () => {
    for (const text of voiced) expect(text).not.toMatch(BRITISH);
  });

  it("keeps tired phrases and exclamation marks out of what is shown and said", () => {
    for (const text of voiced) expect(text).not.toMatch(TIRED);
  });

  it("spells out two to nine and uses numerals from 10, on screen", () => {
    // The approved You say lines speak their numbers ("ten minutes", "twelve times"): they are heard, not read, so the rule is the screen's.
    for (const text of onScreen) expect(text).not.toMatch(LONE_DIGIT);
    for (const text of onScreen) expect(text).not.toMatch(/\b(ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty)\b/i);
  });

  it("starts every On screen line with a capital letter", () => {
    for (const picture of SCRIPT) expect(picture.show, picture.id).toMatch(/^[A-Z]/);
  });

  it("names GitHub's own terms nowhere", () => {
    for (const text of voiced) expect(text).not.toMatch(/pull request|\bfork/i);
  });

  it("opens the catalog at its address: the QR code's link is the address on the slide", () => {
    expect(CATALOG_URL).toBe(`https://${ADDRESS}/`);
    expect(ADDRESS).toBe("big-cities-health-coalition.github.io/use-case-catalog");
  });
});

describe("the words a click puts on screen", () => {
  it("are the picture's own words: its On screen line, You say or They see, case and a closing period aside", () => {
    const plain = (text: string) => text.toLowerCase().replace(/\.$/, "");
    for (const picture of SCRIPT) {
      const words = plain([picture.show, picture.say, ...picture.see].join(" "));
      for (const step of picture.steps) for (const label of step.show) if (!OFF_SCRIPT.includes(label)) expect(words, `${picture.id}.${step.id}`).toContain(plain(label));
    }
  });

  it("are short enough to read from the back of the room, but the thank-you cards' lines, with no stray spaces", () => {
    for (const text of labels) {
      if (!LONG_LABEL.includes(text) && !OFF_SCRIPT.includes(text)) expect(text.length, text).toBeLessThanOrEqual(60);
      expect(text).toBe(text.trim());
    }
    for (const text of LONG_LABEL) expect(labels).toContain(text);
  });

  it("give the six steps from form to live page in order, under a title of their own", () => {
    const how = SCRIPT.find((picture) => picture.id === "how")!;
    expect(how.steps[0].show).toEqual(["Form", "Request", "Draft", "Checks", "Approval", "Live"]);
  });
});

describe("the story lines", () => {
  it("give each picture none, one or two, with the thank-you slide the only one without", () => {
    for (const picture of SCRIPT) expect(picture.story.length, picture.id).toBeLessThanOrEqual(2);
    expect(SCRIPT.filter((picture) => picture.story.length === 0).map((picture) => picture.id)).toEqual(["thanks"]);
  });

  it("are sentences with no stray spaces", () => {
    for (const picture of SCRIPT)
      for (const line of picture.story) {
        expect(line, picture.id).toBe(line.trim());
        expect(line, picture.id).toMatch(/^[A-Z].*\.$/);
      }
  });

  it("each fit one line of 100 characters", () => {
    for (const picture of SCRIPT) for (const line of picture.story) expect(line.length, `${picture.id} ${line.length}`).toBeLessThanOrEqual(100);
  });
});
