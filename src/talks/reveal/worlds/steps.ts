/**
 * How a world's steps are written down: by the script's own ids, so a step
 * the script has and the world does not (or the other way round) stops the
 * build, and the order is always the script's. Shared by every world: read
 * it, do not fork it.
 */
import type { Ground, Move, StepCopy, StepDef } from "@/components/deck/engine";
import type { MoveOpts } from "@/components/deck/engine/types";
import { step, storyKeys, tell } from "@/components/deck/kit";
import { PARTS, SCRIPT, type Picture, type WorldId } from "../script";
import { pictureOf } from "../script/find";

/** What one click does: the whole chain of its picture's beats, written with `chain()` (docs/bchc-flow-revision.md, section 1). */
export type Beat = { moves?: (Move | Move[])[] };

/** A step's id in its world: its picture's id and its own. With the world's id it is the step's address. */
export const stepId = (pictureId: string, id: string) => `${pictureId}.${id}`;

/**
 * A picture's steps, in the script's order: `play` for every picture of
 * this talk. Every step of the picture must be given, and no other.
 * `ground` puts every step of it on that ground (the title slide's navy)
 * instead of the deck's white.
 */
export function picture(pictureId: string, beats: Record<string, Beat>, opts: { ground?: Ground } = {}): StepDef[] {
  const { steps } = pictureOf(pictureId);
  const unknown = Object.keys(beats).filter((id) => !steps.some((entry) => entry.id === id));
  if (unknown.length) throw new Error(`"${pictureId}" has no step "${unknown.join('", "')}" in the script.`);
  return steps.map(({ id }) => {
    const beat = beats[id];
    if (!beat) throw new Error(`"${pictureId}" is missing its step "${id}".`);
    const made = step(stepId(pictureId, id), beat.moves ?? []);
    return opts.ground ? { ...made, ground: opts.ground } : made;
  });
}

/** The id of a picture's story band (kit `Story`); its lines are this and `a` or `b`. */
export const storyId = (pictureId: string) => `story.${pictureId}`;

/** A picture's story line comes up (`tell`): `0` is line A and `1` line B. Fails loudly if the script gives the picture no such line. */
export function story(pictureId: string, line: 0 | 1, opts?: MoveOpts): Move[] {
  const { story: lines } = pictureOf(pictureId);
  if (line >= lines.length) throw new Error(`"${pictureId}" has ${lines.length} story line(s), not a line ${line === 0 ? "A" : "B"}.`);
  return tell(storyKeys(storyId(pictureId), lines.length)[line], opts);
}

/** The pictures a world holds, in the script's order. */
export const picturesOf = (world: WorldId) => SCRIPT.filter((entry) => entry.world === world);

/** Each step's name in the overview and its note for the speaker: the slide's number and heading, and its You say. */
export const copyFor = (pictures: readonly Picture[]): Record<string, StepCopy> =>
  Object.fromEntries(pictures.flatMap((entry) => entry.steps.map((s) => [stepId(entry.id, s.id), { title: `${entry.number}. ${entry.name}`, note: entry.say }])));

/** A world's name in the overview: the names of the parts it holds. */
export function worldTitle(world: WorldId): string {
  const [first, ...rest] = [...new Set(picturesOf(world).map((entry) => entry.part))].map((part) => PARTS[part - 1]);
  return [first, ...rest.map((name) => name.charAt(0).toLowerCase() + name.slice(1))].join(", and ");
}
