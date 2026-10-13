import { THE_REVEAL } from "./part-1-the-reveal";
import type { Picture } from "./types";

export type { Picture, Step, WorldId } from "./types";
export { WORLDS } from "./types";
export { ADDRESS, CATALOG_URL } from "./part-1-the-reveal";

/** The one part, as the script heads it: `PARTS[part - 1]` is a part's name. */
export const PARTS = ["The reveal"];

/** Every picture of the talk, in the order it is given. */
export const SCRIPT: Picture[] = [...THE_REVEAL];
