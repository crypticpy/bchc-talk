/**
 * The reveal world's tests' shared view of it: the stage's markup parsed
 * into its keyed parts, the compiled steps, and small readers over both.
 * Test code only; the world itself never imports it.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compile, type Compiled, type Play } from "@/components/deck/engine/compile";
import type { Vars } from "@/components/deck/engine/types";
import { picturesOf } from "../steps";
import { CARD_AWAY, ROW } from "./layout";
import { revealEntry } from "./world";

/** A part of the stage: its key, its classes, the part it sits in, and whether it paints anything of its own. */
export type Node = { key: string; classes: string[]; parent: Node | null; paints: boolean };

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
/** Elements that put something on the stage; the rest (g, div, svg, span) only hold other things. */
const PAINT = new Set(["path", "circle", "rect", "line", "polyline", "polygon", "ellipse", "text", "img", "image"]);

/** Every keyed part in the markup, each with the keyed part it sits inside, and every text node. */
export function parse(markup: string) {
  const nodes: Node[] = [];
  const text: string[] = [];
  const stack: (Node | null)[] = [];
  const keyed = () => stack.findLast((node) => node) ?? null;
  const paint = (node: Node | null) => {
    const owner = node ?? keyed();
    if (owner) owner.paints = true;
  };
  for (const [, close, tag, attrs, selfClosing, words] of markup.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>|([^<]+)/g)) {
    if (words !== undefined) {
      const trimmed = words.replace(/&#x27;/g, "'").replace(/&amp;/g, "&").trim();
      if (trimmed) {
        text.push(trimmed);
        paint(null);
      }
    } else if (close) stack.pop();
    else {
      const key = attrs.match(/data-build="([^"]+)"/)?.[1];
      const node = key ? { key, classes: attrs.match(/class="([^"]+)"/)?.[1].split(/\s+/) ?? [], parent: keyed(), paints: false } : null;
      if (node) nodes.push(node);
      if (PAINT.has(tag.toLowerCase())) paint(node);
      if (!selfClosing && !VOID.has(tag.toLowerCase())) stack.push(node);
    }
  }
  return { nodes, text };
}

export const markup = renderToStaticMarkup(createElement(revealEntry.world.Scene));
export const { nodes, text } = parse(markup);
export const compiled = compile(revealEntry.world);
export const steps = revealEntry.world.steps;
export const pictures = picturesOf("reveal");
export const nodeOf = (key: string) => nodes.find((node) => node.key === key) ?? null;

const IDS = new Set(pictures.map((picture) => picture.id));
/** The picture a key belongs to: the one its title, story line or first segment names; the home page is slide 1's. */
export const pictureOfKey = (key: string) =>
  key === "home" || key.startsWith("home.") ? "title" : key.startsWith("title.") && IDS.has(key.slice(6)) ? key.slice(6) : key.startsWith("story.") ? key.split(".")[1] : key.split(".")[0];

/** Hidden by its own values: gone, undrawn, under its mask, wiped shut, or the row's card waiting off the stage. */
const shut = (vars: Vars | undefined, node: Node) =>
  !!vars &&
  (vars.autoAlpha === 0 ||
    vars["--d"] === 0 ||
    Number(vars.yPercent ?? 0) >= 100 ||
    ["--wt", "--wr", "--wb", "--wl"].some((inset) => vars[inset] === 100) ||
    (node.key === ROW.cardKey && vars.x === CARD_AWAY));

/** Parts the kit's CSS keeps hidden until a move shows them: a lit edge, a done fill. */
const hiddenByCss = (node: Node) => node.classes.some((name) => /(^|__|-)(lit|done)$/.test(name));

export const hiddenAt = (state: Record<string, Vars>, node: Node | null): boolean => !!node && (shut(state[node.key], node) || hiddenByCss(node) || hiddenAt(state, node.parent));

const elementsOf = (key: string) => nodes.filter((node) => node.key === key).length;

/** When a play has landed: its last element, staggers counted. */
export const endOf = (play: Play) => play.at + play.duration + play.stagger * Math.max(0, ("key" in play ? elementsOf(play.key) : 1) - 1);

export const longestStep = (world: Compiled) => world.plays.map((plays) => Math.max(0, ...plays.map(endOf)));

export type PartPlay = Extract<Play, { key: string }>;
const stepAt = (id: string) => steps.findIndex((step) => step.id === id);
/** A click's plays on parts, in the order the step gives them. */
export const playsOf = (id: string) => compiled.plays[stepAt(id)].filter((play): play is PartPlay => "key" in play);
/** The plays of a click that move one part, optionally only those that move one of its properties. */
export const movesOf = (id: string, key: string, prop?: string) => playsOf(id).filter((play) => play.key === key && (!prop || prop in play.on));
/** The picture at the end of a click. */
export const endState = (id: string) => compiled.states[stepAt(id) + 1];
