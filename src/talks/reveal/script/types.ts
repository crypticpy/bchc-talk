/** The talk's worlds, in the order the deck gives them: the reveal is short enough to be one stage. */
export const WORLDS = ["reveal"] as const;
export type WorldId = (typeof WORLDS)[number];

/**
 * One click. A click brings a whole picture, its beats chaining on their
 * own, so every picture of this talk has one step, `play`. `show` is every
 * label the click puts on the stage besides the picture's title and its
 * story lines, in the order they arrive. Scenes take their words from here
 * (`shown()`), never from a literal.
 */
export type Step = { id: string; show: string[] };

/**
 * One slide of the approved script (docs/reveal-script.md), word for word.
 * `show` is its On screen line, `say` its You say, `see` its They see, and
 * `story` its story lines, zero to two, so the deck reads without a
 * speaker. `number` is the script's own, and `name` its heading.
 */
export type Picture = { id: string; number: string; part: number; world: WorldId; name: string; show: string; say: string; see: string[]; story: string[]; steps: Step[] };
