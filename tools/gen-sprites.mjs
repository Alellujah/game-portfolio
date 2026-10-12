// Generates the overworld walking sprite sheets (placeholder pixel art).
//
// Sheet layout (per character): 4 columns x 4 rows of FRAME_W x FRAME_H frames.
//   rows:    0 down, 1 up, 2 left, 3 right
//   columns: 0 stand, 1 walk A, 2 stand, 3 walk B
// Any PNG following this layout can replace the generated files in public/sprites/.
//
// Usage: node tools/gen-sprites.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const FRAME_W = 16;
const FRAME_H = 24;

const PALETTE = {
  K: "#0c0a10", // outline (dark enough to land on the darkest GB shade)
  H: "#3b2a20", // hair
  h: "#5c4232", // hair highlight
  S: "#f2c19a", // skin
  s: "#d49a74", // skin shadow
  W: "#e6eef4", // lens / shirt
  B: "#6a4a38", // beard
  O: "#4f7a8c", // hoodie
  o: "#3a5a68", // hoodie shadow
  N: "#ececec", // drawstrings / sneakers
  P: "#3a3f58", // jeans
  Y: "#c0563a", // backpack
  y: "#8a3a28", // backpack shadow
  M: "#d9d6c8", // monitor casing
  m: "#a8a496", // monitor shadow
  C: "#7fc8d8", // screen
  c: "#4f98a8", // screen dark
  U: "#7c7f8c", // suit
  u: "#5c5f6c", // suit shadow
  T: "#c0392b", // tie
  A: "#8a5a30", // briefcase
  D: "#2a2a30", // dress shoes
  R: "#8a5a2b", // kid hair
  r: "#b07a40", // kid hair highlight
  E: "#f2c94c", // kid dress
  e: "#d4a72c", // kid dress shadow
  Q: "#e05a7a", // kid shoes
};

/* ---------------------------------- Fábio --------------------------------- */

const fabioLegs = {
  stand: [
    "...KPPPPPPPPK...",
    "...KPPPKKPPPK...",
    "...KPPK..KPPK...",
    "..KNNNK..KNNNK..",
    "..KKKKK..KKKKK..",
  ],
  walk: [
    "...KPPPPPPPPK...",
    "...KPPPKKPPPK...",
    "..KNNNK..KPPK...",
    "..KKKKK..KNNNK..",
    ".........KKKKK..",
  ],
  sideStand: [
    "....KPPPPPPK....",
    "....KPPPPPPK....",
    "....KPPPPPK.....",
    "...KNNNNNK......",
    "...KKKKKKK......",
  ],
  sideWalk: [
    "...KPPPPPPPK....",
    "..KPPPK.KPPPK...",
    ".KPPK....KPPK...",
    "KNNNK....KNNNK..",
    "KKKK......KKKK..",
  ],
};

const fabioDown = [
  "....KKKKKKKK....",
  "...KHHhHHhHHK...",
  "..KHHHHHHHHHHK..",
  "..KHHhHHHHhHHK..",
  "..KHSSSSSSSSHK..",
  "..KSKKKSSKKKSK..",
  "..KSKWKKKKWKSK..",
  "..KSKKKSSKKKSK..",
  "..KsSSSSSSSSsK..",
  "..KBSSSKKSSSBK..",
  "...KBBBBBBBBK...",
  "....KKKKKKKK....",
  "...KKOOooOOKK...",
  "..KOOONOONOOOK..",
  ".KOOOONOONOOOOK.",
  ".KoOOOOOOOOOOoK.",
  ".KSoOOooooOOoSK.",
  "..KKOOOOOOOOKK..",
  "..KooooooooooK..",
];

const fabioUp = [
  "....KKKKKKKK....",
  "...KHHhHHhHHK...",
  "..KHHHHHHHHHHK..",
  "..KHHHhHHHhHHK..",
  "..KHHHHHHHHHHK..",
  "..KHHHHHHHHHHK..",
  "..KKHHHHHHHHKK..",
  "..KsHHHHHHHHsK..",
  "..KsHHHHHHHHsK..",
  "...KHHHHHHHHK...",
  "...KsHHHHHHsK...",
  "....KKKKKKKK....",
  "...KKYYYYYYKK...",
  "..KOKYyYYyYKOK..",
  ".KOOKYYYYYYKOOK.",
  ".KoOKYyyyyYKOoK.",
  ".KSoKYYYYYYKoSK.",
  "..KKOKKKKKKOKK..",
  "..KooooooooooK..",
];

const fabioLeft = [
  ".....KKKKKKK....",
  "....KHHhHHHHK...",
  "...KHHHHHHHhHK..",
  "...KHHHHHHHHHK..",
  "..KHSSSSHHHHHK..",
  "..KKKKSSHHHHHK..",
  "..KWWKKKSHHHHK..",
  "..KKKKSSsHHHHK..",
  ".KSSSSSSsHHHHK..",
  "..KBSSSSsSHHK...",
  "..KBBBBBBsSK....",
  "...KKKKKKKK.....",
  "....KOOOOOKKK...",
  "...KOOOOOOKYYK..",
  "...KOOOOOOKYyK..",
  "...KOOOOOOKyyK..",
  "...KSOOOOOKYYK..",
  "...KoOOOOOKKKK..",
  "...KooooooooK...",
];

/* -------------------------------- Recruiter -------------------------------- */

const recruiterLegs = {
  stand: [
    "...KUUUUUUUUK...",
    "...KUUUKKUUUK...",
    "...KUUK..KUUK...",
    "..KDDDK..KDDDK..",
    "..KKKKK..KKKKK..",
  ],
  walk: [
    "...KUUUUUUUUK...",
    "...KUUUKKUUUK...",
    "..KDDDK..KUUK...",
    "..KKKKK..KDDDK..",
    ".........KKKKK..",
  ],
  sideStand: [
    "....KUUUUUUK....",
    "....KUUUUUUK....",
    "....KUUUUUK.....",
    "...KDDDDDDK.....",
    "...KKKKKKKK.....",
  ],
  sideWalk: [
    "...KUUUUUUUK....",
    "..KUUUK.KUUUK...",
    ".KUUK....KUUK...",
    "KDDDK....KDDDK..",
    "KKKK......KKKK..",
  ],
};

const recruiterDown = [
  "..KKKKKKKKKKKK..",
  ".KMMMMMMMMMMMMK.",
  ".KMKKKKKKKKKKMK.",
  ".KMKCCCCCCCCKMK.",
  ".KMKCCCCCCCCKMK.",
  ".KMKCCKCCKCCKMK.",
  ".KMKCCCCCCCCKMK.",
  ".KMKCKCCCCKCKMK.",
  ".KMKCCKKKKCCKMK.",
  ".KMKKKKKKKKKKMK.",
  ".KmMMMMMMMMMMmK.",
  "..KKKKKmmKKKKK..",
  "...KUUWTTWUUK...",
  "..KUUUWTTWUUUK..",
  ".KUUUUWTTWUUUUK.",
  ".KUuUUUTTUUUuUK.",
  ".KSuUUUUUUUUuSK.",
  "..KKUUUUUUUUKK..",
  "..KuuuuuuuuuuK..",
];

const recruiterUp = [
  "..KKKKKKKKKKKK..",
  ".KMMMMMMMMMMMMK.",
  ".KMMMMMMMMMMMMK.",
  ".KMMMMMMMMMMMMK.",
  ".KMMmmmmmmmmMMK.",
  ".KMMMMMMMMMMMMK.",
  ".KMMmmmmmmmmMMK.",
  ".KMMMMMMMMMMMMK.",
  ".KMMMMMMMMMMMMK.",
  ".KMMMMMMMMMMMMK.",
  ".KmMMMMMMMMMMmK.",
  "..KKKKKmmKKKKK..",
  "...KUUUUUUUUK...",
  "..KUUUUuuUUUUK..",
  ".KUUUUUuuUUUUUK.",
  ".KUuUUUuuUUUuUK.",
  ".KSuUUUuuUUUuSK.",
  "..KKUUUUUUUUKK..",
  "..KuuuuuuuuuuK..",
];

const recruiterLeft = [
  "...KKKKKKKKKK...",
  "..KMMMMMMMMMMK..",
  ".KMMMMMMMMMMMMK.",
  ".KCMMMMMMMMMMMK.",
  ".KCMMMMmmmmMMMK.",
  ".KCMMMMMMMMMMMK.",
  ".KCMMMMmmmmMMMK.",
  ".KCMMMMMMMMMMK..",
  ".KMMMMMMMMMMK...",
  "..KmmmmmmmmK....",
  "...KKKmmKKK.....",
  ".....KUUK.......",
  "....KWUUUUK.....",
  "...KTWUUUUUK....",
  "...KTUUUUUUK....",
  "...KUUUuUUUK....",
  "...KUSUuUUUK....",
  "..KAAKUUUUUK....",
  "..KAAKuuuuuK....",
];

/* --------------------------------- Amalie --------------------------------- */
// Smaller than the adults: same 16x24 frame, padded at the top.

const amalieLegs = {
  stand: [
    "....KSK..KSK....",
    "....KSK..KSK....",
    "...KQQK..KQQK...",
    "...KKKK..KKKK...",
  ],
  walk: [
    "....KSK..KSK....",
    "...KQQK..KSK....",
    "...KKKK..KQQK...",
    ".........KKKK...",
  ],
  sideStand: [
    ".....KSSK.......",
    ".....KSSK.......",
    "....KQQQK.......",
    "....KKKKK.......",
  ],
  sideWalk: [
    "....KSKKSK......",
    "...KSK..KSK.....",
    "..KQQK...KQQK...",
    "..KKKK...KKKK...",
  ],
};

const amalieDress = [
  "....KEEEEEEK....",
  "...KSEEEEEESK...",
  "...KSEEeeEESK...",
  "..KEEEEEEEEEEK..",
  "..KeeeeeeeeeeK..",
];

const amalieDown = [
  ".....KKKKKK.....",
  "...KKRRrRRRKK...",
  "..KRKRRRRRRKRK..",
  ".KRRKRSSSSRKRRK.",
  ".KRKSKSSSSKSKRK.",
  "..KKsSSSSSSsKK..",
  "...KSSSSSSSSK...",
  "....KKKKKKKK....",
  ...amalieDress,
];

const amalieUp = [
  ".....KKKKKK.....",
  "...KKRRrRRRKK...",
  "..KRKRRRRRRKRK..",
  ".KRRKRRRRRRKRRK.",
  ".KRKRRRrRRRRKRK.",
  "..KKRRRRRRRRKK..",
  "...KsRRRRRRsK...",
  "....KKKKKKKK....",
  ...amalieDress,
];

const amalieLeft = [
  "......KKKKK.....",
  "....KKRRrRRK....",
  "...KRRRRRRRRK...",
  "..KSSSRRRRRRKRK.",
  "..KSKSSRRRRRKRRK",
  ".KSSSSSsRRRRKKK.",
  "..KsSSSSsRRK....",
  "...KKKKKKKK.....",
  ".....KEEEEK.....",
  "....KESEEEK.....",
  "....KESEeEK.....",
  "...KEEEEEEEK....",
  "...KeeeeeeeK....",
];

/* --------------------------------- builder --------------------------------- */

const mirror = (rows) => rows.map((r) => [...r].reverse().join(""));

function frames(body, legs, padTop = 0) {
  const pad = Array(padTop).fill(".".repeat(FRAME_W));
  const down = [...pad, ...body.down, ...legs.stand];
  const downWalk = [...pad, ...body.down, ...legs.walk];
  const up = [...pad, ...body.up, ...legs.stand];
  const upWalk = [...pad, ...body.up, ...legs.walk];
  const left = [...pad, ...body.left, ...legs.sideStand];
  const leftWalk = [...pad, ...body.left, ...legs.sideWalk];
  return [
    [down, downWalk, down, mirror(downWalk)],
    [up, upWalk, up, mirror(upWalk)],
    [left, leftWalk, left, leftWalk],
    [mirror(left), mirror(leftWalk), mirror(left), mirror(leftWalk)],
  ];
}

function hex(c) {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

async function writeSheet(name, sheet) {
  const W = FRAME_W * 4;
  const H = FRAME_H * 4;
  const buf = Buffer.alloc(W * H * 4);
  sheet.forEach((row, ry) =>
    row.forEach((frame, cx) => {
      if (frame.length !== FRAME_H) throw new Error(`${name} r${ry} c${cx}: ${frame.length} rows`);
      frame.forEach((line, y) => {
        if (line.length !== FRAME_W) throw new Error(`${name} r${ry} c${cx} y${y}: "${line}" (${line.length})`);
        [...line].forEach((ch, x) => {
          if (ch === ".") return;
          const col = PALETTE[ch];
          if (!col) throw new Error(`${name}: unknown color "${ch}"`);
          const i = ((ry * FRAME_H + y) * W + cx * FRAME_W + x) * 4;
          const [r, g, b] = hex(col);
          buf[i] = r;
          buf[i + 1] = g;
          buf[i + 2] = b;
          buf[i + 3] = 255;
        });
      });
    })
  );
  const out = `public/sprites/${name}.png`;
  await sharp(buf, { raw: { width: W, height: H, channels: 4 } }).png().toFile(out);
  console.log("wrote", out);
}

mkdirSync("public/sprites", { recursive: true });
await writeSheet("fabio", frames({ down: fabioDown, up: fabioUp, left: fabioLeft }, fabioLegs));
await writeSheet(
  "recruiter",
  frames({ down: recruiterDown, up: recruiterUp, left: recruiterLeft }, recruiterLegs)
);
await writeSheet("amalie", frames({ down: amalieDown, up: amalieUp, left: amalieLeft }, amalieLegs, 7));
