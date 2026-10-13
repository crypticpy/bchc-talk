"use client";

import { Deck, NotesView } from "@/components/deck/engine";
import { deck } from "@/talks/reveal/deck";

/*
 * The catalog's reveal, with its deck definition: scenes are components, so
 * the definition lives on the client. No `remotePath`: GitHub Pages serves
 * files only, so the deck is driven from the keyboard, a click or the notes
 * window.
 */

export const RevealDeck = () => <Deck deck={deck} />;

/** The speaker's screen, opened from the deck in a second window of the same browser. */
export const RevealNotes = () => <NotesView deck={deck} />;
