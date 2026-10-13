import type { Picture } from "./types";

/** The catalog's web address as the last slide sets it, large, without its scheme. */
export const ADDRESS = "big-cities-health-coalition.github.io/use-case-catalog";

/** The address the last slide's QR code opens (public/reveal/qr.svg; qr.test.ts decodes it). */
export const CATALOG_URL = `https://${ADDRESS}/`;

/** The ten-minute reveal of the coalition's use case catalog, at AIxPH 2026 in Baltimore. One part, six slides, one click each. */
export const THE_REVEAL: Picture[] = [
  {
    id: "title",
    number: "1",
    part: 1,
    world: "reveal",
    name: "Title",
    show: "The Public Health AI and Tech Exchange",
    say: "Thank you, Supawit, and thank you, Microsoft, for hosting this workshop. I'm Phillip Bays from Austin Public Health, and I have ten minutes to show you something the coalition launched this month.",
    see: ["On navy, the title, the line under it, and \"Phillip Bays, Austin Public Health\" under that. The live catalog's home page rises in on the right and settles."],
    story: ["The Big Cities Health Coalition's use case catalog, live now."],
    steps: [{ id: "play", show: ["Phillip Bays, Austin Public Health"] }],
  },
  {
    id: "catalog",
    number: "2",
    part: 1,
    world: "reveal",
    name: "The catalog",
    show: "Every department's AI and data projects, in one place.",
    say: "This is the catalog. Big city health departments post what they've built, and everyone else can find it, read how it was done, and contact the team. No more building the same dashboard twelve times.",
    see: ["The catalog's home page moves to the left. One project's page lifts out of it and grows, and three of its parts light one at a time: \"what it does\", \"what it took\" and \"contact\"."],
    story: [
      "Departments post the AI tools, data projects and digital services they've built.",
      "Everyone in the coalition can find them, see how they were built and reach the people behind them.",
    ],
    steps: [{ id: "play", show: ["what it does", "what it took", "contact"] }],
  },
  {
    id: "how",
    number: "3",
    part: 1,
    world: "reveal",
    name: "How it works",
    show: "Posting a project takes a form. Approving it takes one reviewer.",
    say: "Here's how it runs. You fill in a form. That opens a request on GitHub. Scripts turn it into a draft page and check it. A reviewer reads it and approves it, and minutes later it's live. There's no server and no database, so there's nothing to pay for and nothing to patch.",
    see: ["Six boxes in a row: \"Form\", \"Request\", \"Draft\", \"Checks\", \"Approval\" and \"Live\". A card moves along them. Draft and Checks take the process's colour as the card passes, and Checks gets the \"passed\" tick. A person stands over Approval, and the card waits there for the \"a person approves\" mark, then moves on, and Live lights."],
    story: [
      "The form opens a request on GitHub. Scripts draft the page and check it, and a person approves it.",
      "It's live in minutes, on GitHub Pages, with no server or database to pay for or secure.",
    ],
    steps: [{ id: "play", show: ["Form", "Request", "Draft", "Checks", "Approval", "Live"] }],
  },
  {
    id: "built",
    number: "4",
    part: 1,
    world: "reveal",
    name: "How we built it",
    show: "Austin Public Health built it with AI agents, on GitHub.",
    say: "We built it ourselves. Our team described what the coalition needed, and AI agents planned, built, tested and reviewed it, with a person approving every change. The coalition's version, with its own branding, was rebuilt over a weekend. This is how Austin Public Health builds tools now, and we'll share how at the coalition's work group.",
    see: ["The Austin Public Health logo, and under it three steps from left to right: \"People decide what to build\", \"AI agents build and test it\" and \"A person approves the release\". People stand in the first and last steps and AI agents in the middle one, and the last step gets the \"a person approves\" mark. Under the steps the project's record, \"On GitHub\", draws as a line, and each change on it gets the same mark."],
    story: [
      "Our team described what the coalition needed. AI agents planned, built, tested and reviewed it.",
      "A person approved every change, and the coalition's version was rebuilt over one weekend.",
    ],
    steps: [{ id: "play", show: ["People decide what to build", "AI agents build and test it", "A person approves the release", "On GitHub"] }],
  },
  {
    id: "thanks",
    number: "5",
    part: 1,
    world: "reveal",
    name: "Thank you",
    show: "Thank you.",
    say: "Supawit and Microsoft, thank you for hosting us today and for helping the coalition get set up on GitHub. Jenny and the Big Cities Health Coalition, thank you for the idea and the push to launch. And the Austin Public Health team, thank you for building it.",
    see: ["Three cards rise one at a time. \"Microsoft\", with \"For hosting this workshop, and for helping the coalition get set up on GitHub.\" and the name \"Supawit Ket-udom\". \"Big Cities Health Coalition\", with \"For the idea, the push to launch, and the Data Modernization Work Group.\" and the name \"Jennifer Schitter\". \"Austin Public Health\", with \"For the team that built it.\""],
    story: [],
    steps: [
      {
        id: "play",
        show: [
          "Microsoft",
          "For hosting this workshop, and for helping the coalition get set up on GitHub.",
          "Supawit Ket-udom",
          "Big Cities Health Coalition",
          "For the idea, the push to launch, and the Data Modernization Work Group.",
          "Jennifer Schitter",
          "Austin Public Health",
          "For the team that built it.",
        ],
      },
    ],
  },
  {
    id: "post",
    number: "6",
    part: 1,
    world: "reveal",
    name: "Post your project",
    show: "Post your project.",
    say: "Post one project this month. If every department posts one, every department gets all of them. Scan the code, and come find me after. Thank you.",
    see: ["The catalog's web address, large, with a QR code beside it that opens the catalog."],
    story: ["If every department posts one project, every department gets all of them."],
    steps: [{ id: "play", show: [ADDRESS] }],
  },
];
