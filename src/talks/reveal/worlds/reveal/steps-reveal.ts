/**
 * The reveal, one click a slide: the title with the catalog's home page,
 * one project's page lifting out of it, the row from form to live
 * page, how Austin Public Health built it, the thank-you cards, and the
 * catalog's address. Each click plays its slide's whole chain: the first
 * beat changes the title and clears what the last slide does not carry,
 * its story lines among them; the story lines land with the beats they
 * explain. A beat's own times are seconds from the beat's start; `chain()`
 * places the beats.
 */
import type { Move } from "@/components/deck/engine";
import { EASE, cardAt, chain, dim, draw, fill, hide, lines, mark, retitle, rise, show, to, wipe, type ChainBeat, type Counts } from "@/components/deck/kit";
import { picture, picturesOf, story } from "../steps";
import { AUTOMATIC, BUILT, CARD_AWAY, ENTRY, HOME, HOME_RISE, HOW, OPENING, POST, ROW, THANK, storyKeysOf, titleKey, titleOf } from "./layout";

/** The first slide's chain waits for the world's arrival fade. */
const ARRIVE = 0.35;
const keys = (list: readonly { key: string }[]) => list.map((entry) => entry.key);

/** The ids several elements carry: a two-line title. */
export const COUNTS: Counts = Object.fromEntries(
  picturesOf("reveal")
    .map((entry) => [titleKey(entry.id), titleOf(entry.id).lines.length] as const)
    .filter(([, count]) => count > 1),
);

/** One click: its beats chained (`at` seconds after the click), each beat timed to its last element. */
const play = (beats: ChainBeat[], at?: number) => ({ moves: chain(beats, { at, counts: COUNTS }) });

/** A slide's first beat starts here: its title replaces the last one's, and the last one's picture and story lines go, together, at the click. */
const leave = (from: string, next: string, parts: readonly string[]): Move[] => [
  ...retitle(titleKey(from), titleKey(next)),
  ...hide([...parts, ...storyKeysOf(from)], { duration: 0.3, stagger: 0, at: 0 }),
];

/* 1. Title */

const title = picture(
  "title",
  {
    play: play(
      [
        { moves: [lines(OPENING.title.key, { at: 0 })] },
        { with: true, hold: 0.5, moves: [story("title", 0)] },
        { with: true, hold: 0.45, moves: [rise(OPENING.credit.key, { at: 0 })] },
        // The live catalog's home page rises in on the right and settles.
        { with: true, hold: 0.35, moves: [to(HOME.key, { autoAlpha: 1, "--y": 0, "--s": 1 }, { autoAlpha: 0, "--y": HOME_RISE.y, "--s": HOME_RISE.s }, { duration: 1.4, ease: EASE.out, at: 0 })] },
      ],
      ARRIVE,
    ),
  },
  { ground: "navy" },
);

/* 2. The catalog */

/** A place on the page lights: its ring draws, and its tab shows on the ring. */
const lit = (i: number) => [draw(ENTRY.fields[i].ring.key, { duration: 0.6, at: 0 }), show(ENTRY.fields[i].tab.key, { at: 0.45 })];

const catalog = picture("catalog", {
  play: play([
    // The home page moves to the left as line A comes up.
    { moves: [leave("title", "catalog", [OPENING.credit.key]), to(HOME.key, HOME.small, { "--x": 0, "--y": 0, "--s": 1 }, { duration: 1.1, ease: EASE.page, at: 0.3 })] },
    { with: true, hold: 0.5, moves: [story("catalog", 0)] },
    // One project's page lifts out of the home page and grows; the home page steps back.
    {
      moves: [
        to(ENTRY.key, { autoAlpha: 1, "--x": 0, "--y": 0, "--s": 1 }, { autoAlpha: 0, ...ENTRY.lifted }, { duration: 1.1, ease: EASE.page, at: 0 }),
        dim(HOME.key, { at: 0.3 }),
      ],
    },
    // What it does, what it took, contact: one at a time.
    { hold: 0.2, moves: lit(0) },
    { hold: 0.5, moves: lit(1) },
    { hold: 0.5, moves: lit(2) },
    { hold: 0.3, moves: [story("catalog", 1)] },
  ]),
});

const catalogParts = [HOME.key, ENTRY.key, ...ENTRY.fields.flatMap((field) => [field.ring.key, field.tab.key])];

/* 3. How it works */

/** How long the card takes from one well to the next, and to come in from off the stage into the first. */
const HOP = 0.4;
const IN = 0.5;
const LIVE = ROW.stations[ROW.stations.length - 1];

/** The row is drawn once, in reading order: each well, its heading once the well is under way, and the link out of it. */
const rowDraws = (at: number): Move[] => [
  ...draw(ROW.stations.map((station) => station.key), { duration: 0.75, stagger: 0.16, at }),
  ...rise(ROW.stations.map((station) => station.headKey), { duration: 0.5, stagger: 0.16, at: at + 0.35 }),
  ...draw(ROW.links.map((link) => link.key), { duration: 0.3, stagger: 0.16, at: at + 0.4 }),
];

/** The card comes in from off the left edge and rests in the first well, Form. */
const cardArrives = (at: number): Move[] => to(ROW.cardKey, { x: cardAt(ROW, 0) }, { x: CARD_AWAY }, { duration: IN, ease: EASE.page, at });

/** The card goes on from well `n - 1` to well `n`: the well it leaves keeps a quiet fill, unless scripts worked there, and Draft and Checks take the process's tint as it arrives. */
function cardHops(n: number, at: number): Move[] {
  const timing = { duration: HOP, ease: EASE.draw, at };
  const leaves = ROW.stations[n - 1].doneKey;
  const arrives = ROW.stations[n].doneKey;
  return [
    ...to(ROW.cardKey, { x: cardAt(ROW, n) }, { x: cardAt(ROW, n - 1) }, timing),
    ...(AUTOMATIC.includes(leaves) ? [] : wipe(leaves, { from: "left", ...timing })),
    ...(AUTOMATIC.includes(arrives) ? wipe(arrives, { from: "left", ...timing }) : []),
  ];
}

/** The card has landed in Live: the well takes its fill and lights, and the card takes the catalog's edge. */
const liveLights = (at: number): Move[] => [
  ...wipe(LIVE.doneKey, { from: "left", duration: 0.4, at }),
  ...show(LIVE.litKey, { at }),
  ...to(ROW.cardKey, { "--landed": 1 }, { "--landed": 0 }, { duration: 0.5, ease: EASE.soft, at }),
];

const how = picture("how", {
  play: play([
    { moves: [leave("catalog", "how", catalogParts), rowDraws(0.3)] },
    // The card comes into Form and goes on to Request, as line A says.
    { with: true, hold: 1.2, moves: [cardArrives(0), cardHops(1, 0.65), story("how", 0, { at: 0.65 })] },
    // Into Draft, then Checks: the scripts' wells take the process's tint, and the checks pass.
    { hold: 0.4, moves: [cardHops(2, 0)] },
    { hold: 0.3, moves: [cardHops(3, 0), show(HOW.tick.key, { duration: 0.3, at: HOP })] },
    // Into Approval, where the card waits: a person approves it.
    { hold: 0.3, moves: [cardHops(4, 0), draw(ROW.humanKey!, { duration: 0.9, at: HOP }), draw(HOW.person.key, { at: HOP + 0.3 }), mark(HOW.mark.key, { at: HOP + 1.0 })] },
    // Only then on to Live, which takes its fill and lights as the card lands, and line B says how it is hosted.
    { hold: 0.3, moves: [cardHops(5, 0), liveLights(HOP)] },
    { hold: 0.2, moves: [story("how", 1)] },
  ]),
});

const howParts = [ROW.key, HOW.person.key, HOW.mark.key];

/* 4. How we built it */

const [decide, build, approve] = BUILT.steps;
/** A step arrives: its outline draws and its words come up under where its figures stand. */
const stepIn = (step: typeof decide, at = 0) => [draw(step.key, { duration: 0.6, at }), rise(step.label.key, { at: at + 0.2 })];
const [person0, person1, person2] = keys(BUILT.people);
const agents = keys(BUILT.agents);

const built = picture("built", {
  play: play([
    { moves: [leave("how", "built", howParts), rise(BUILT.logo.key, { at: 0.5 })] },
    { with: true, hold: 0.8, moves: [story("built", 0)] },
    // People decide what to build.
    { hold: 0.2, moves: [...stepIn(decide), draw([person0, person1], { duration: 0.7, stagger: 0.12, at: 0.3 })] },
    // AI agents build and test it: each arrives, then its ring fills as it works.
    {
      hold: 0.1,
      moves: [draw(BUILT.links[0].key, { duration: 0.4, at: 0 }), ...stepIn(build, 0.2), rise(agents, { stagger: 0.1, at: 0.5 }), fill(agents, { duration: 0.6, stagger: 0.1, at: 1.0 })],
    },
    // A person approves the release.
    {
      hold: 0.1,
      moves: [draw(BUILT.links[1].key, { duration: 0.4, at: 0 }), ...stepIn(approve, 0.2), draw(person2, { duration: 0.7, at: 0.5 }), mark(BUILT.mark.key, { at: 1.0 })],
    },
    { hold: 0.2, moves: [story("built", 1)] },
    // The record on GitHub draws, a change at each point on it, and each change gets a person's approval.
    {
      with: true,
      hold: 0.4,
      moves: [
        rise(BUILT.record.label.key, { at: 0 }),
        draw(BUILT.record.key, { duration: 1.2, at: 0.2 }),
        show(BUILT.commits.map((commit) => commit.key), { duration: 0.3, stagger: 0.1, at: 0.3 }),
        ...BUILT.commits.map((commit, i) => mark(commit.approval, { duration: 0.5, at: 1.2 + i * 0.1 })),
      ],
    },
  ]),
});

const builtParts = [
  BUILT.logo.key,
  ...BUILT.steps.flatMap((step) => [step.key, step.label.key]),
  ...keys(BUILT.links),
  ...keys(BUILT.people),
  ...agents,
  BUILT.mark.key,
  BUILT.record.key,
  BUILT.record.label.key,
  ...BUILT.commits.flatMap((commit) => [commit.key, commit.approval]),
];

/* 5. Thank you */

const thanks = picture("thanks", {
  play: play([
    { moves: leave("built", "thanks", builtParts) },
    // The three cards rise one at a time.
    ...THANK.map((card, i): ChainBeat => ({ with: true, hold: i === 0 ? 0.6 : 0.9, moves: [rise(card.key, { duration: 0.9, at: 0 })] })),
  ]),
});

/* 6. Post your project */

const post = picture("post", {
  play: play([
    { moves: leave("thanks", "post", keys(THANK)) },
    { with: true, hold: 0.5, moves: [story("post", 0)] },
    { with: true, hold: 0.6, moves: [rise(POST.address.key, { at: 0 })] },
    { with: true, hold: 0.5, moves: [rise(POST.qr.key, { at: 0 })] },
  ]),
});

export const STEPS = [...title, ...catalog, ...how, ...built, ...thanks, ...post];
