/**
 * The reveal of the coalition's use case catalog: a ten-minute talk at
 * AIxPH 2026 in Baltimore, in one world of six slides. A step's address,
 * its name and its speaker note all come from the script (script/). Only
 * the frame (the Austin Public Health logo, footer and click number)
 * persists: the deck has no persistent layer and no backdrop. Its id names
 * its own channel to the notes window, apart from the main talk's.
 */
import type { DeckDef } from "@/components/deck/engine";
import { withBase } from "@/lib/base-path";
import { Frame } from "./frame";
import { revealEntry } from "./worlds/reveal/world";

export const deck: DeckDef = {
  id: "reveal",
  title: "The Public Health AI and Tech Exchange",
  notesPath: withBase("/reveal/notes/"),
  Frame,
  worlds: [revealEntry],
};
