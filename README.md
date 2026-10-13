# Using AI in Public Health Practice

The slides for Austin Public Health's talk to the Big Cities Health Coalition Data Modernization Work Group. The deck runs in a web browser. Each click plays one slide's animation, and every slide carries its own words on screen, so you can click through it on your own without a speaker.

Live: https://crypticpy.github.io/bchc-talk/

A second, shorter deck, the ten-minute reveal of the coalition's use case catalog at AIxPH 2026 in Baltimore, is at `/reveal/` (live: https://crypticpy.github.io/bchc-talk/reveal/). Its script is `docs/reveal-script.md`.

The repo is also a starting point for your own talk built the same way: animated, click to play, with every word held to an approved script, and built with an AI coding agent. See [Build your own deck from this](#build-your-own-deck-from-this).

## Run it on your computer

You need Node.js 20.9 or later.

```sh
npm install
npm run dev
```

Then open http://localhost:3000 and press Start.

## Present it

The start screen checks that the typefaces and pictures have loaded, and lets you turn on reduced motion. Press Start, or Enter, when it is ready.

- Click, Space, the right arrow or a presentation clicker: next slide.
- Left arrow or Backspace: back one slide.
- Home and End: the first slide and the last one.
- Type a slide number, then Enter: jump to that slide.
- O: an overview of every slide.
- N: the speaker notes in a second window. They are also at `/notes/` (http://localhost:3000/notes/ locally) and follow the deck as it moves. The notes window has Back, Next, Blank screen and Reset clock buttons and shows the talk's clock. Printing it gives the whole script.
- B or full stop: blank the screen.
- H: a rehearsal readout of frame timings.

Use the browser's own full screen for presenting. Every slide has its own address, such as `#/start/ask.play`, so you can open the talk on any slide.

The last slide is the finale: a grid of every slide in the talk, made from still images captured from the deck itself.

The original version on the Above Earth Productions site could be driven from a phone. That remote needs a server, so it is not included here. The keyboard, a clicker and the notes window all work.

## How it is built

- `docs/bchc-talk-script.md` is the single source for the talk. Every word on screen and every speaker note is read from it, and the tests fail if the slides and the script disagree.
- The talk is drawn as six worlds under `src/talks/bchc/worlds/`, each holding one or two parts of the script. Each world is one stage that holds several slides.
- `src/components/deck/` is the engine that plays the worlds (keys, addresses, the notes window) and the kit of parts the slides are drawn with, in Austin Public Health's colours and the Geist typeface (`docs/bchc-brand.md`).
- `npx vitest run` runs the tests, `npx eslint .` the linter and `npx tsc --noEmit` the type check. `src/components/deck/check/deck-check.mjs` checks every slide in a real browser; its header says how to run it.
- Pushing to `main` builds a static copy of the site and publishes it to GitHub Pages (`.github/workflows/pages.yml`).

## Build your own deck from this

Start with the guides in [docs/](docs/README.md):

- [How a deck works](docs/how-a-deck-works.md): the model, from script to screen.
- [Build your own deck](docs/build-your-own-deck.md): copy the repo, write your script, build your worlds, run the checks, publish, and replace this talk.
- [Working with an AI agent](docs/working-with-an-ai-agent.md): the process, prompts to paste, and the rules an agent must keep.
- [Kit reference](docs/kit-reference.md): every part, verb and token you draw and animate with.

The rest of `docs/` is this talk's own design history. To contribute, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Credits

Austin Public Health, for the Big Cities Health Coalition Data Modernization Work Group.
