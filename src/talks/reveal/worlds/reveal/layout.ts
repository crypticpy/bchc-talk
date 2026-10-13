/**
 * The reveal's one world: where every part of its six slides goes, the id
 * each takes, and the words it holds. Every word is read from the script; a
 * line break is given by the word it falls after. A place on a still is
 * given in the still's own pixels, from its frame's top left corner. A
 * part's id starts with its slide's id, but for the catalog's home page
 * (`home`), which slide 1 brings in and slide 2 carries to the left.
 */
import { CONTENT_TOP, STORY, box, stations, storyKeys, tabBeside, type Box, type Point, type StoryBand } from "@/components/deck/kit";
import { withBase } from "@/lib/base-path";
import { ADDRESS } from "../../script";
import { breakAfter, pictureOf, shown, storyOf } from "../../script/find";
import { storyId } from "../steps";

/* Titles and story lines */

export const TITLE = { x: 96, y: 152 };

/** Each slide's title, broken where it would run past the stage's safe edge. */
const BREAKS: Record<string, string[]> = { catalog: ["projects,"], how: ["easy"], built: ["built it"] };

export const titleKey = (pictureId: string) => `title.${pictureId}`;
export const titleOf = (pictureId: string) => ({ key: titleKey(pictureId), x: TITLE.x, y: TITLE.y, lines: breakAfter(pictureOf(pictureId).show, ...(BREAKS[pictureId] ?? [])) });

/** A slide's story band: under its one- or two-line title. Slide 1 sets its one line itself, under the title, at 48 (OPENING). */
export const bandOf = (pictureId: string): StoryBand => (titleOf(pictureId).lines.length > 1 ? "two" : "one");

/** A slide's story line ids, A then B. */
export const storyKeysOf = (pictureId: string) => storyKeys(storyId(pictureId), storyOf(pictureId).length);

/* 1. Title */

/** A line of 32 px text is this tall. */
export const LINE = 44.8;

/** The stills, as saved: a version in the name, because a changed picture under an old name is served from cache. */
export const STILLS = {
  home: [{ src: withBase("/reveal/catalog-home.v1.webp"), alt: "The live catalog's home page: its name, the headline Reuse what other health departments have already built, a search box, and the buttons Browse the catalog and Share your use case" }],
  entry: [
    {
      src: withBase("/reveal/catalog-entry.v1.webp"),
      alt: "One project's page in the live catalog, Machine learning record linkage from Public Health – Seattle & King County: what it does, the skills, readiness and cost it took to stand up, and who to contact",
    },
  ],
};
/** The home page's still is the top of the live page, 1280 by 570 of its pixels (capture-home.mjs), saved at twice that. */
const HOME_CROP = { w: 1280, h: 570 };
/** The project's page's still is the top of its live page, 1248 by 560 of its pixels (capture-entry.mjs), saved at twice that. */
const ENTRY_CROP = { w: 1248, h: 560 };

/** Slide 1: the title, the line under it at 48, the credit in soft, and the catalog's home page on the right. */
export const OPENING = {
  title: titleOf("title"),
  line: { key: storyKeysOf("title")[0], x: TITLE.x, y: 248, lines: storyOf("title") },
  credit: { key: "title.credit", text: shown("title", "play")[0], at: box(TITLE.x, 336, 960, LINE) },
};

/** The home page at rest on slide 1, whole, in a frame of the crop's own shape: on the right under the credit, its right edge on the safe edge. */
const HOME_W = 1152;
const HOME_AT = box(STORY.x + STORY.w - HOME_W, 460, HOME_W, Math.round((HOME_W * HOME_CROP.h) / HOME_CROP.w));
/** How far the home page rises as it comes in, and how small it starts. */
export const HOME_RISE = { y: 80, s: 0.96 };

/* 2. The catalog */

/** One project's page, under the two-line title's story band, in a frame of the crop's own shape 468 high: its right edge on the safe edge. */
const ENTRY_H = 468;
const ENTRY_W = Math.round((ENTRY_H * ENTRY_CROP.w) / ENTRY_CROP.h);
const ENTRY_AT = box(STORY.x + STORY.w - ENTRY_W, CONTENT_TOP.two + 16, ENTRY_W, ENTRY_H);
/** Where slide 2 carries the home page: the left column, 48 px short of the opened page and level with it. */
const HOME_SMALL = { x: STORY.x, w: ENTRY_AT.x - 48 - STORY.x };
const homeScale = HOME_SMALL.w / HOME_AT.w;
/** The home page as it sits small on slide 2: the project's page lifts out of it. */
const HOME_SMALL_AT = box(HOME_SMALL.x, Math.round(ENTRY_AT.y + ENTRY_AT.h / 2 - (HOME_AT.h * homeScale) / 2), HOME_SMALL.w, HOME_AT.h * homeScale);
const lift = HOME_SMALL_AT.w / ENTRY_AT.w;
const round2 = (n: number) => Math.round(n * 1000) / 1000;

export const HOME = {
  key: "home",
  still: "home.still",
  at: HOME_AT,
  crop: HOME_CROP,
  /** Slide 2's place for it, as a move about its top left corner. */
  small: { "--x": HOME_SMALL_AT.x - HOME_AT.x, "--y": HOME_SMALL_AT.y - HOME_AT.y, "--s": round2(homeScale) },
};

/**
 * Where the parts slide 2 rings sit on the project's page, in the crop's own
 * (page) pixels, as capture-entry.mjs prints them: the project's name, the
 * summary under it, the grid of facts, and the contact panel.
 */
const ENTRY_PLACES = { title: box(16, 60, 704, 48), summary: box(16, 128, 704, 26), facts: box(16, 286, 888, 204), contact: box(952, 392, 280, 148) };
const entryScale = ENTRY_AT.w / ENTRY_CROP.w;
/** A ring round places on the page, in the frame's pixels: from the first place's top left to the last's foot, opened out by `pad` page pixels so the ink clears what it rings. */
const ringRound = (first: Box, last: Box, pad: number) => {
  const [x, y] = [first.x - pad, first.y - pad];
  const [right, foot] = [Math.max(first.x + first.w, last.x + last.w) + pad, last.y + last.h + pad];
  return box(Math.round(x * entryScale), Math.round(y * entryScale), Math.round((right - x) * entryScale), Math.round((foot - y) * entryScale));
};
/**
 * What it does: the name and summary, its tab on the right in the empty
 * page beside them. What it took: the grid of facts (skills, readiness, the
 * cost to stand up), its tab under it. Contact: the panel, its tab on top
 * of it, where the hidden "On this page" box held its place.
 */
const RINGS: { ring: Box; side: Parameters<typeof tabBeside>[1] }[] = [
  { ring: ringRound(ENTRY_PLACES.title, ENTRY_PLACES.summary, 8), side: "right" },
  { ring: ringRound(ENTRY_PLACES.facts, ENTRY_PLACES.facts, 6), side: "below-left" },
  { ring: ringRound(ENTRY_PLACES.contact, ENTRY_PLACES.contact, 6), side: "above-left" },
];

export const ENTRY = {
  key: "catalog.entry",
  still: "catalog.entry.still",
  at: ENTRY_AT,
  crop: ENTRY_CROP,
  places: ENTRY_PLACES,
  /** Where the page starts: as wide as the small home page, centred on it, as a move about its top left corner. */
  lifted: {
    "--x": Math.round(HOME_SMALL_AT.x + HOME_SMALL_AT.w / 2 - (ENTRY_AT.w * lift) / 2 - ENTRY_AT.x),
    "--y": Math.round(HOME_SMALL_AT.y + HOME_SMALL_AT.h / 2 - (ENTRY_AT.h * lift) / 2 - ENTRY_AT.y),
    "--s": round2(lift),
  },
  fields: RINGS.map(({ ring, side }, i) => ({ ring: { key: `catalog.ring.${i}`, at: ring }, tab: { key: `catalog.tab.${i}`, at: tabBeside(ring, side) }, text: shown("catalog", "play")[i] })),
};

/* 3. How it works */

/** The row's wells sit low enough that the person and the mark over Approval, scaled with the row, clear the story band. */
const ROW_Y = 820;
export const ROW = stations({ id: "how.row", x: STORY.x, y: ROW_Y, headings: shown("how", "play"), human: 4 });
/** The row is laid out at the kit's size and scaled about its first well's top left corner, so it spans the band from margin to margin. */
export const ROW_SCALE = STORY.w / ROW.box.w;
/** Where the scaled row lands on the stage, and where a point given in the row's own pixels lands. */
export const ROW_ON_STAGE = {
  ...box(ROW.box.x, ROW.box.y, ROW.box.w * ROW_SCALE, ROW.box.h * ROW_SCALE),
  at: (p: Point): Point => ({ x: ROW.box.x + (p.x - ROW.box.x) * ROW_SCALE, y: ROW.box.y + (p.y - ROW.box.y) * ROW_SCALE }),
};
/** Where the card waits, in the row's own pixels, before it arrives in the first well: off the stage's left edge once scaled. */
export const CARD_AWAY = -(ROW.card.x + 300);
const [, , , CHECKS, APPROVAL] = ROW.stations;

/** Set inside the row, in its own pixels, so they scale with it. */
export const HOW = {
  /** A person over the Approval station, with the orange mark between them and the heading. */
  person: { key: "how.person", at: box(APPROVAL.x + 80, ROW_Y - 208, 48, 64) },
  mark: { key: "how.mark", at: { x: APPROVAL.x + 104, y: ROW_Y - 116 } },
  /** The passed tick on the Checks heading's line, after the word. */
  tick: { key: "how.tick", at: { x: CHECKS.headAt.x + 140, y: CHECKS.headAt.y + 20 }, r: 14 },
};
/** The wells where scripts do the work: their fill is the process's tint (reveal.css), and it comes as the card arrives. */
export const AUTOMATIC = [ROW.stations[2].doneKey, CHECKS.doneKey];

/* 4. How we built it */

const LOGO_H = 64;
const LOGO_W = Math.round((LOGO_H * 1920) / 646);
const STEP = { y: 664, w: 520, h: 220, gap: (STORY.w - 3 * 520) / 2 };
const STEPS = [0, 1, 2].map((i) => box(STORY.x + i * (STEP.w + STEP.gap), STEP.y, STEP.w, STEP.h));
const FIGURE_Y = STEP.y + 28;
const AGENT_Y = FIGURE_Y + 34;
const RECORD_Y = 956;
const RECORD_LABEL_W = 200;
const COMMITS = 9;
const [DECIDE, BUILD, APPROVE, ON_GITHUB] = shown("built", "play");
const centre = (at: Box) => at.x + at.w / 2;

export const BUILT = {
  logo: { key: "built.logo", src: withBase("/brand/aph-logo.v1.png"), at: box(960 - LOGO_W / 2, CONTENT_TOP.two + 48, LOGO_W, LOGO_H) },
  /** Each step's outline, and its words under its figures: people, AI agents, a person with the mark. */
  steps: STEPS.map((at, i) => ({ key: `built.step.${i}`, label: { key: `built.step.${i}.label`, at: box(at.x + 24, at.y + 112, at.w - 48, 92) }, text: [DECIDE, BUILD, APPROVE][i], at, tone: (["plain", "process", "human"] as const)[i] })),
  links: [0, 1].map((i) => ({ key: `built.link.${i}`, from: STEPS[i], to: STEPS[i + 1] })),
  people: [
    { key: "built.person.0", at: box(centre(STEPS[0]) - 60, FIGURE_Y, 48, 64) },
    { key: "built.person.1", at: box(centre(STEPS[0]) + 12, FIGURE_Y, 48, 64) },
    { key: "built.person.2", at: box(centre(STEPS[2]) - 64, FIGURE_Y, 48, 64) },
  ],
  agents: (["planner", "builder", "tester", "reviewer"] as const).map((role, i) => ({ key: `built.agent.${i}`, role, at: { x: centre(STEPS[1]) - 108 + i * 72, y: AGENT_Y } })),
  mark: { key: "built.mark", at: { x: centre(STEPS[2]) + 40, y: AGENT_Y } },
  /** The project's record under the steps: its name, then a line with a change on it at even steps, each approved. */
  record: {
    key: "built.record",
    label: { key: "built.record.label", text: ON_GITHUB, at: box(STORY.x, RECORD_Y - LINE / 2, RECORD_LABEL_W, LINE) },
    from: { x: STORY.x + RECORD_LABEL_W, y: RECORD_Y },
    to: { x: STORY.x + STORY.w, y: RECORD_Y },
  },
  commits: Array.from({ length: COMMITS }, (_, i) => {
    const x = Math.round(STORY.x + RECORD_LABEL_W + 80 + (i * (STORY.w - RECORD_LABEL_W - 160)) / (COMMITS - 1));
    return { key: `built.commit.${i}`, approval: `built.approval.${i}`, at: { x, y: RECORD_Y } };
  }),
};

/* 5. Thank you */

const CARD = { y: 380, w: 544, h: 460, gap: (STORY.w - 3 * 544) / 2 };
const THANKS = shown("thanks", "play");
/** Each card's words, as the script lists them: a name, a line, and the person, where there is one. */
const CARDS = [THANKS.slice(0, 3), THANKS.slice(3, 6), THANKS.slice(6)];

export const THANK = CARDS.map(([name, line, who], i) => ({ key: `thanks.card.${i}`, at: box(STORY.x + i * (CARD.w + CARD.gap), CARD.y, CARD.w, CARD.h), name, line, who }));

/* 6. Post your project */

/**
 * The QR code is what the room photographs: its code about 520 px square
 * (37 modules at 14 px), its right edge on the safe edge, centred in the
 * space under the story line. The file (public/reveal/qr.svg) is 45 modules
 * across with its 4-module white quiet zone, so the image is set that much
 * larger, the quiet zone running into the white margin. The address keeps its
 * size and breaks before ".github.io", so its two lines leave the code room,
 * and it sits level with the code.
 */
const MODULE = 14;
const QR_CODE = 37 * MODULE;
const QR_QUIET = 4 * MODULE;
const QR_CODE_AT = box(STORY.x + STORY.w - QR_CODE, Math.round((CONTENT_TOP.one + 960 - QR_CODE) / 2), QR_CODE, QR_CODE);
const ADDRESS_H = 180;
export const POST = {
  address: { key: "post.address", lines: breakAfter(ADDRESS, "coalition"), at: box(STORY.x, QR_CODE_AT.y + (QR_CODE - ADDRESS_H) / 2, 1000, ADDRESS_H) },
  qr: {
    key: "post.qr",
    src: withBase("/reveal/qr.svg"),
    /** The code itself, quiet zone left out. */
    code: QR_CODE_AT,
    at: box(QR_CODE_AT.x - QR_QUIET, QR_CODE_AT.y - QR_QUIET, QR_CODE + 2 * QR_QUIET, QR_CODE + 2 * QR_QUIET),
  },
};
