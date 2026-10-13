/**
 * Reading the script by id, for the scene builders: every word on the stage
 * is taken from the script's data, never typed a second time.
 */
import { SCRIPT } from "./index";
import type { Picture, Step } from "./types";

export function pictureOf(id: string): Picture {
  const picture = SCRIPT.find((entry) => entry.id === id);
  if (!picture) throw new Error(`The script has no picture "${id}".`);
  return picture;
}

export function stepOf(pictureId: string, stepId: string): Step {
  const step = pictureOf(pictureId).steps.find((entry) => entry.id === stepId);
  if (!step) throw new Error(`The script's picture "${pictureId}" has no step "${stepId}".`);
  return step;
}

/** The strings a step shows. */
export const shown = (pictureId: string, stepId: string) => stepOf(pictureId, stepId).show;

/** A picture's story lines, A then B: none, one or two. */
export const storyOf = (pictureId: string) => pictureOf(pictureId).story;

/**
 * A string set on several lines, broken after each of the given words. The
 * words must be in the string, in order: a line break is the author's, and a
 * changed script that no longer holds the word fails loudly, not silently.
 */
export function breakAfter(text: string, ...words: string[]): string[] {
  const lines: string[] = [];
  let rest = text;
  for (const word of words) {
    const at = rest.indexOf(word);
    if (at < 0) throw new Error(`"${text}" cannot break after "${word}".`);
    lines.push(rest.slice(0, at + word.length).trim());
    rest = rest.slice(at + word.length);
  }
  return [...lines, rest.trim()];
}

/** A file path shortened to `max` characters by taking out the middle of its folder name: the folder it is in and the file it is stay readable. */
export function elide(path: string, max: number): string {
  if (path.length <= max) return path;
  const parts = path.split("/");
  const tail = `/${parts[parts.length - 1]}`;
  const head = parts.slice(0, -1).join("/");
  const keep = max - tail.length - 1;
  return keep > 0 ? `${head.slice(0, keep)}…${tail}` : `${path.slice(0, max - 1)}…`;
}
