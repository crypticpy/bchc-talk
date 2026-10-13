import { describe, expect, it } from "vitest";
import { compile } from "@/components/deck/engine/compile";
import { deck as main } from "@/talks/bchc/deck";
import { deck } from "./deck";
import { Frame } from "./frame";
import { SCRIPT, WORLDS } from "./script";

const addresses = deck.worlds.flatMap(({ world }) => world.steps.map((step) => `${world.id}/${step.id}`));

describe("the reveal's deck", () => {
  it("gives its worlds in the plan's order", () => {
    expect(deck.worlds.map(({ world }) => world.id)).toEqual([...WORLDS]);
  });

  it("has every step of the script once, in the script's order, six in all", () => {
    expect(addresses).toEqual(SCRIPT.flatMap((picture) => picture.steps.map((step) => `${picture.world}/${picture.id}.${step.id}`)));
    expect(new Set(addresses).size).toBe(addresses.length);
    expect(addresses).toHaveLength(6);
  });

  it("gives every step its slide's name and the script's You say as the speaker's note", () => {
    for (const picture of SCRIPT) {
      const { copy } = deck.worlds.find(({ world }) => world.id === picture.world)!;
      for (const step of picture.steps) expect(copy?.[`${picture.id}.${step.id}`]).toEqual({ title: `${picture.number}. ${picture.name}`, note: picture.say });
    }
  });

  it("compiles every world, with a starting value for everything a step moves", () => {
    for (const { world } of deck.worlds) expect(() => compile(world), world.id).not.toThrow();
  });

  it("keeps nothing on the stage across slides but the Austin Public Health frame", () => {
    expect(deck.chrome).toBeUndefined();
    expect(deck.Backdrop).toBeUndefined();
    expect(deck.Frame).toBe(Frame);
  });

  it("sets the title on navy, and every other step on the deck's white", () => {
    const navy = deck.worlds.flatMap(({ world }) => world.steps.filter((step) => step.ground === "navy").map((step) => step.id));
    expect(navy).toEqual(["title.play"]);
    expect(deck.worlds.flatMap(({ world }) => world.steps).every((step) => step.ground === undefined || step.ground === "navy")).toBe(true);
  });

  it("talks to its notes on a channel of its own, and opens its own notes page, apart from the main talk's", () => {
    expect(deck.id).not.toBe(main.id);
    expect(deck.notesPath).toMatch(/\/reveal\/notes\/$/);
    expect(deck.notesPath).not.toBe(main.notesPath);
  });
});
