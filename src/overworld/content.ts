// Layout + dialog content for the overworld (Fábio's office).
// Grid coordinates: x = column (0..MAP_W-1), z = row (0..MAP_H-1), z grows towards the camera.

export type Dir = "up" | "down" | "left" | "right";
export type Cell = [x: number, z: number];

export const DIRS: Record<Dir, Cell> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

export const MAP_W = 11;
export const MAP_H = 9;

export const SPAWN: Cell = [5, 4];
// The rival blocks the door, bottom-center of the room
export const RIVAL: Cell = [5, 8];
export const AMALIE_SPAWN: Cell = [8, 6];
export const NPC_HINT_Y = { rival: 2.5, amalie: 1.75 };

export type Page = {
  text: string;
  link?: { label: string; href: string };
};

export type Interactable = {
  id: string;
  cells: Cell[];
  // Height of the hint bubble / sparkle above the object
  hintY: number;
  pages: Page[];
};

// Cells occupied by furniture/decor (not walkable). Interactables add their own cells.
export const DECOR_CELLS: Cell[] = [
  [0, 8], // plant
  [10, 8], // plant
  [10, 0], // plant
];

export const INTERACTABLES: Interactable[] = [
  {
    id: "window",
    hintY: 2.95,
    // Window sits on the back wall; inspect it from the row below
    cells: [
      [6, -1],
      [7, -1],
    ],
    pages: [
      { text: "A view over the rooftops of Prague." },
      { text: "Fábio lives here, working with teams all over the world." },
      {
        text: "DevOps engineer & software developer. A product-minded builder.",
      },
      {
        text: "He turns uncertain ideas into software people can use, test and improve.",
      },
      { text: "From the interface to the infrastructure behind it." },
    ],
  },
  {
    id: "pc",
    hintY: 1.75,
    cells: [
      [0, 0],
      [1, 0],
    ],
    pages: [
      { text: "The PC is on. A folder called CLIENT WORK is open." },
      {
        text: "BOOKIE (2026): scheduling for independent beauty pros. In closed beta!",
        link: { label: "bookie.pt", href: "https://bookie.pt/" },
      },
      {
        text: "VCLEVEL: a platform for fractional executive services.",
        link: { label: "vclevel.pt", href: "https://vclevel.pt/" },
      },
      {
        text: "HOPEN: a portfolio-led website for a creative consultancy.",
        link: { label: "wearehopen.com", href: "https://wearehopen.com/" },
      },
      {
        text: "Also: Revomed, Força dos Números, Chafariz das Gravatas, Mário Canastro...",
        link: {
          label: "fabioalbuquerque.pt",
          href: "https://fabioalbuquerque.pt/",
        },
      },
    ],
  },
  {
    id: "shelf",
    hintY: 2.55,
    cells: [
      [3, 0],
      [4, 0],
    ],
    pages: [
      { text: "A bookshelf packed with well-thumbed manuals." },
      { text: "TypeScript, React, Next.js, GraphQL, Astro..." },
      { text: "Python, PHP, WordPress, HTML, CSS and JavaScript." },
      { text: "A few design books too, from the Product Designer days." },
    ],
  },
  {
    id: "rack",
    hintY: 2.35,
    cells: [[9, 0]],
    pages: [
      { text: "A server rack hums quietly. The LEDs blink happily." },
      { text: "AWS, CloudFormation, API Gateway, Cognito, Docker, GitLab CI/CD." },
      {
        text: "Cloud architecture, infra automation, CI/CD and platform engineering.",
      },
      { text: "Uptime: excellent. Coffee consumption: also excellent." },
    ],
  },
  {
    id: "whiteboard",
    hintY: 2.2,
    cells: [[10, 2]],
    pages: [
      { text: "A career timeline is scribbled on the whiteboard." },
      { text: "2013-2017: Web Designer at Compta, then ITEN." },
      {
        text: "2017-2020: Frontend at MAJ, Product Designer at Compta, Frontend & UX at Altitude.",
      },
      {
        text: "2021-2025: Frontend Developer at INFOR. React, TypeScript, micro-frontends.",
      },
      { text: "2025-now: DevOps Engineer at INFOR. Freelancing since 2020." },
    ],
  },
  {
    id: "tv",
    hintY: 1.7,
    cells: [
      [0, 4],
      [0, 5],
    ],
    pages: [
      { text: "A retro console is plugged into the TV." },
      { text: "Fábio loves retro games. That's how this whole idea started." },
      { text: "The cartridge label says GAME-PORTFOLIO... Wait, that's this game!" },
    ],
  },
  {
    id: "phone",
    hintY: 1.15,
    cells: [[10, 5]],
    pages: [
      { text: "A phone with a sticky note on it." },
      {
        text: "Open to freelance projects and new roles. Say hi!",
        link: {
          label: "linkedin.com/in/fabio-rma",
          href: "https://www.linkedin.com/in/fabio-rma/",
        },
      },
      {
        text: "Or drop a line through the website.",
        link: {
          label: "fabioalbuquerque.pt",
          href: "https://fabioalbuquerque.pt/",
        },
      },
    ],
  },
];

export const INTRO_PAGES: Page[] = [
  { text: "Welcome to Fábio's office!" },
  { text: "Use the ARROWS to walk and ENTER to inspect things." },
  { text: "When you're ready, talk to the one blocking the door..." },
];

export function rivalPages(
  playerId: string | undefined,
  discovered: number
): Page[] {
  const total = INTERACTABLES.length;
  const hint: Page[] =
    discovered < total
      ? [
          {
            text: `You've only looked at ${discovered}/${total} things... Oh well, no turning back now!`,
          },
        ]
      : [{ text: "Seen everything already? Impressive. Now prove yourself!" }];

  if (playerId === "developer") {
    return [
      { text: "RECRUITER: Hi Fábio! I have an exciting opportunity for you..." },
      { text: "Only 7 rounds of interviews and a take-home of 40 hours!" },
      ...hint,
    ];
  }
  return [
    { text: "Fábio: So you've been snooping around my office?" },
    ...hint,
    { text: "Let's see if your offer can beat my mons!" },
  ];
}

const AMALIE_LINES: Page[][] = [
  [{ text: "AMALIE: Tag! You're it!" }, { text: "She runs off giggling." }],
  [{ text: "AMALIE: Did you see the server lights? They blink like stars!" }],
  [{ text: "AMALIE: Shhh... the computer is thinking." }],
  [{ text: "AMALIE: Can we play the game on the TV? Pleeease?" }],
];

export function amaliePages(times: number): Page[] {
  return AMALIE_LINES[times % AMALIE_LINES.length];
}
