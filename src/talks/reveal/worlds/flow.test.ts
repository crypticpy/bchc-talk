import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { compile, type Play } from "@/components/deck/engine/compile";
import { CHAIN } from "@/components/deck/kit";
import { deck } from "../deck";

/**
 * The flow every world keeps (docs/bchc-flow-revision.md, sections 1 and 6):
 * a click plays a chain that never leaves the stage sitting still for more
 * than 3 s, so the deck never looks stuck.
 */
const worlds = deck.worlds.map(({ world }) => {
  const markup = renderToStaticMarkup(createElement(world.Scene));
  /** How many elements carry each part's id: a move's stagger runs across all of them. */
  const counts = new Map<string, number>();
  for (const [, key] of markup.matchAll(/data-build="([^"]+)"/g)) counts.set(key, (counts.get(key) ?? 0) + 1);
  return { world, compiled: compile(world), counts };
});

/** The longest the stage sits still in one click: from the click, or from everything before having landed, to the next play's start. */
function longestStill(plays: readonly Play[], counts: ReadonlyMap<string, number>): number {
  let landed = 0;
  let still = 0;
  for (const play of [...plays].sort((a, b) => a.at - b.at)) {
    still = Math.max(still, play.at - landed);
    const many = "key" in play ? (counts.get(play.key) ?? 1) : 1;
    landed = Math.max(landed, play.at + play.duration + play.stagger * Math.max(0, many - 1));
  }
  return still;
}

describe("the talk's flow", () => {
  it("measures a click's stillness from the click and from what has landed, staggers counted", () => {
    const play = (key: string, at: number, duration: number, stagger = 0): Play => ({ key, on: {}, at, duration, ease: "none", stagger });
    expect(longestStill([play("a", 0.5, 1), play("b", 4, 1), play("c", 1, 0.2)], new Map())).toBe(2.5);
    expect(longestStill([play("a", 0, 1, 1), play("b", 4, 1)], new Map([["a", 3]]))).toBe(1);
    expect(longestStill([], new Map())).toBe(0);
  });

  it("never leaves the stage still for more than 3 s inside a click", () => {
    const stuck = worlds.flatMap(({ world, compiled, counts }) =>
      compiled.plays.flatMap((plays, n) => {
        const still = longestStill(plays, counts);
        return still > CHAIN.still + 1e-9 ? [`${world.id}/${world.steps[n].id} sits still for ${still.toFixed(2)} s`] : [];
      }),
    );
    expect(stuck).toEqual([]);
  });
});
