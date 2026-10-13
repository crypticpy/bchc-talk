/** The reveal's one world: its six slides, under the script's addresses. */
import type { WorldEntry } from "@/components/deck/engine";
import { copyFor, picturesOf, worldTitle } from "../steps";
import { Scene } from "./scene";
import { STEPS } from "./steps-reveal";

export const revealEntry: WorldEntry = {
  title: worldTitle("reveal"),
  world: { id: "reveal", Scene, steps: STEPS },
  copy: copyFor(picturesOf("reveal")),
};
