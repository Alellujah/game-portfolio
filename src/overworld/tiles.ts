// Pixel-art drawing for the 2D overworld, in the same 5 greys as the battle art.
// Everything is drawn with filled rects on a 16px tile grid (Pokémon Red style).

export const TILE = 16;
// Map rows start two tiles above row 0: rows -2 and -1 are the back wall
export const WALL_ROWS = 2;

const GB = ["#1c1b1b", "#585654", "#908e8c", "#c7c5c3", "#e7e5e4"];
type Shade = 0 | 1 | 2 | 3 | 4;

type Ctx = CanvasRenderingContext2D;

const r = (ctx: Ctx, x: number, y: number, w: number, h: number, s: Shade) => {
  ctx.fillStyle = GB[s];
  ctx.fillRect(x, y, w, h);
};

// Outlined box: dark 1px border filled with a shade
const box = (ctx: Ctx, x: number, y: number, w: number, h: number, fill: Shade) => {
  r(ctx, x, y, w, h, 0);
  r(ctx, x + 1, y + 1, w - 2, h - 2, fill);
};

// Map cell -> pixel position of the tile's top-left corner
export const cellX = (x: number) => x * TILE;
export const cellY = (z: number) => (z + WALL_ROWS) * TILE;

/* ------------------------------- static layer ------------------------------ */

function walls(ctx: Ctx, width: number) {
  r(ctx, 0, 0, width, 32, 4);
  for (let x = 0; x < width; x += 8) r(ctx, x, 2, 1, 24, 3);
  r(ctx, 0, 0, width, 2, 0);
  // baseboard
  r(ctx, 0, 26, width, 6, 2);
  r(ctx, 0, 26, width, 1, 0);
  r(ctx, 0, 31, width, 1, 1);
}

function floor(ctx: Ctx, width: number, rows: number) {
  const y0 = cellY(0);
  r(ctx, 0, y0, width, rows * TILE, 4);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < width / TILE; col++) {
      const x = col * TILE;
      const y = y0 + row * TILE;
      r(ctx, x, y + 15, 16, 1, 3);
      r(ctx, x + 15, y, 1, 16, 3);
      if ((row + col) % 2 === 0) r(ctx, x + 7, y + 7, 1, 1, 3);
    }
  }
}

function windowPrague(ctx: Ctx) {
  const x = cellX(6);
  box(ctx, x + 1, 3, 30, 22, 2);
  // night skyline: castle on the left, Týn church spires on the right
  r(ctx, x + 2, 19, 28, 5, 1);
  r(ctx, x + 4, 14, 7, 6, 1);
  r(ctx, x + 6, 10, 1, 4, 1);
  r(ctx, x + 9, 9, 1, 5, 1);
  r(ctx, x + 20, 12, 2, 8, 1);
  r(ctx, x + 24, 12, 2, 8, 1);
  r(ctx, x + 20, 10, 1, 2, 1);
  r(ctx, x + 25, 10, 1, 2, 1);
  for (const [lx, ly] of [[5, 21], [9, 22], [13, 20], [18, 22], [23, 21], [27, 22]])
    r(ctx, x + lx, ly, 1, 1, 4);
  r(ctx, x + 24, 5, 3, 3, 4); // moon
  // frame cross + sill
  r(ctx, x + 15, 4, 2, 20, 4);
  r(ctx, x + 2, 13, 28, 1, 4);
  r(ctx, x, 24, 32, 2, 3);
  r(ctx, x, 26, 32, 1, 0);
}

function deskPC(ctx: Ctx) {
  const x = cellX(0);
  const y = cellY(0);
  // desk
  box(ctx, x + 1, y + 3, 30, 9, 2);
  r(ctx, x + 2, y + 4, 28, 1, 3);
  r(ctx, x + 3, y + 12, 2, 4, 0);
  r(ctx, x + 27, y + 12, 2, 4, 0);
  // monitor (rises over the wall)
  box(ctx, x + 3, y - 10, 15, 12, 0);
  r(ctx, x + 4, y - 9, 13, 9, 1);
  r(ctx, x + 9, y + 2, 3, 2, 0);
  // keyboard
  box(ctx, x + 19, y + 6, 9, 3, 4);
  // lamp
  r(ctx, x + 26, y - 4, 1, 8, 0);
  box(ctx, x + 23, y - 7, 6, 4, 4);
}

function bookshelf(ctx: Ctx) {
  const x = cellX(3);
  const y = cellY(-1) - 2;
  box(ctx, x, y, 32, 34, 1);
  const shades: Shade[] = [4, 2, 3, 4, 3, 2, 4, 3];
  for (let shelf = 0; shelf < 3; shelf++) {
    const sy = y + 2 + shelf * 10;
    let bx = x + 2;
    let i = shelf * 3;
    while (bx < x + 29) {
      const w = 2 + ((i * 7) % 2);
      const h = 7 - ((i * 5) % 3);
      r(ctx, bx, sy + (8 - h), w, h, shades[i % shades.length]);
      bx += w + 1;
      i++;
    }
    r(ctx, x + 1, sy + 8, 30, 2, 0);
  }
}

function serverRack(ctx: Ctx) {
  const x = cellX(9);
  const y = cellY(-1) - 2;
  box(ctx, x + 1, y, 14, 34, 1);
  for (let i = 0; i < 5; i++) {
    r(ctx, x + 2, y + 2 + i * 6, 12, 5, 0);
    r(ctx, x + 3, y + 3 + i * 6, 6, 3, 2);
  }
}

function whiteboard(ctx: Ctx) {
  const x = cellX(10);
  const y = cellY(2);
  r(ctx, x + 3, y + 9, 1, 7, 0);
  r(ctx, x + 12, y + 9, 1, 7, 0);
  box(ctx, x + 1, y - 3, 14, 13, 4);
  // timeline doodle
  r(ctx, x + 3, y + 3, 10, 1, 1);
  for (const dx of [3, 6, 9, 12]) r(ctx, x + dx, y + 2, 1, 3, 0);
  r(ctx, x + 3, y, 6, 1, 2);
  r(ctx, x + 6, y + 6, 6, 1, 2);
}

function tv(ctx: Ctx) {
  const x = cellX(0);
  const y = cellY(4);
  // cabinet (bottom tile) with the console on it
  box(ctx, x, y + 14, 16, 16, 2);
  r(ctx, x + 2, y + 22, 12, 1, 1);
  box(ctx, x + 4, y + 16, 8, 4, 3);
  r(ctx, x + 6, y + 17, 4, 1, 1);
  // TV (top tile)
  box(ctx, x + 1, y + 1, 14, 13, 1);
  r(ctx, x + 3, y + 3, 10, 8, 0);
}

function phoneTable(ctx: Ctx) {
  const x = cellX(10);
  const y = cellY(5);
  box(ctx, x + 1, y + 4, 14, 11, 2);
  r(ctx, x + 2, y + 5, 12, 1, 3);
  box(ctx, x + 4, y + 1, 7, 5, 1);
  r(ctx, x + 3, y + 1, 9, 2, 0);
  r(ctx, x + 11, y + 8, 3, 3, 4); // sticky note
}

function rug(ctx: Ctx) {
  const x = cellX(3);
  const y = cellY(3);
  box(ctx, x, y, 80, 48, 2);
  r(ctx, x + 3, y + 3, 74, 42, 4);
  r(ctx, x + 4, y + 4, 72, 40, 2);
  for (let i = 0; i < 4; i++) r(ctx, x + 26 + i * 8, y + 22, 4, 4, 4);
}

function doorway(ctx: Ctx, width: number, doorCol: number) {
  const y = cellY(9);
  r(ctx, 0, y, width, TILE, 0);
  const x = cellX(doorCol);
  r(ctx, x, y, TILE, TILE, 1);
  for (let i = 2; i < 14; i += 3) r(ctx, x + 2, y + i, 12, 1, 2);
}

function pot(ctx: Ctx, x: number, y: number) {
  box(ctx, x + 4, y + 9, 8, 7, 1);
  r(ctx, x + 5, y + 10, 6, 1, 2);
}

/** Everything that never changes, drawn once to an offscreen canvas. */
export function drawStatic(ctx: Ctx, width: number, doorCol: number, plants: [number, number][]) {
  walls(ctx, width);
  floor(ctx, width, 9);
  doorway(ctx, width, doorCol);
  rug(ctx);
  windowPrague(ctx);
  deskPC(ctx);
  bookshelf(ctx);
  serverRack(ctx);
  whiteboard(ctx);
  tv(ctx);
  phoneTable(ctx);
  for (const [cx, cz] of plants) pot(ctx, cellX(cx), cellY(cz));
}

/* ------------------------------ animated bits ------------------------------ */

/** Blinking LEDs, code scrolling on the PC, the TV game, swaying plants. */
export function drawAnimated(ctx: Ctx, t: number, plants: [number, number][]) {
  // PC screen: code lines slowly scrolling
  {
    const x = cellX(0) + 5;
    const y = cellY(0) - 8;
    const off = Math.floor(t * 2) % 4;
    for (let i = 0; i < 4; i++) {
      const len = [8, 5, 10, 6][(i + off) % 4];
      r(ctx, x + ((i + off) % 2), y + i * 2, len, 1, i % 2 ? 3 : 4);
    }
  }
  // Server LEDs
  {
    const x = cellX(9) + 11;
    const y = cellY(-1) + 1;
    for (let i = 0; i < 5; i++) {
      const on = Math.sin(t * (3 + i * 1.7) + i) > 0.1;
      r(ctx, x, y + i * 6, 2, 1, on ? 4 : 1);
    }
  }
  // TV: a tiny battle on screen
  {
    const x = cellX(0) + 3;
    const y = cellY(4) + 3;
    r(ctx, x, y, 10, 8, 3);
    const hop = Math.floor(t * 3) % 2;
    r(ctx, x + 1, y + 4 - hop, 3, 3, 1);
    r(ctx, x + 6, y + 1 + hop, 3, 3, 1);
    r(ctx, x, y + 7, 10, 1, 2);
  }
  // Plants: leaves sway one pixel
  for (const [cx, cz] of plants) {
    const x = cellX(cx) + (Math.sin(t * 1.5 + cx) > 0 ? 1 : 0);
    const y = cellY(cz);
    r(ctx, x + 2, y - 1, 12, 11, 0);
    r(ctx, x + 3, y, 10, 9, 2);
    r(ctx, x + 5, y + 1, 3, 3, 3);
    r(ctx, x + 9, y + 4, 2, 2, 3);
  }
}

/* ---------------------------------- extras --------------------------------- */

/** 16x16 speech bubble with "!" (alert) or an "A" button (interact hint). */
export function drawBubble(ctx: Ctx, x: number, y: number, glyph: "!" | "A") {
  r(ctx, x + 2, y, 12, 1, 0);
  r(ctx, x + 1, y + 1, 1, 1, 0);
  r(ctx, x + 14, y + 1, 1, 1, 0);
  r(ctx, x, y + 2, 1, 8, 0);
  r(ctx, x + 15, y + 2, 1, 8, 0);
  r(ctx, x + 1, y + 10, 1, 1, 0);
  r(ctx, x + 14, y + 10, 1, 1, 0);
  r(ctx, x + 2, y + 11, 4, 1, 0);
  r(ctx, x + 10, y + 11, 4, 1, 0);
  r(ctx, x + 2, y + 1, 12, 10, 4);
  r(ctx, x + 1, y + 2, 14, 8, 4);
  // tail
  r(ctx, x + 6, y + 11, 4, 1, 4);
  r(ctx, x + 6, y + 12, 1, 1, 0);
  r(ctx, x + 9, y + 12, 1, 1, 0);
  r(ctx, x + 7, y + 12, 2, 1, 4);
  r(ctx, x + 7, y + 13, 2, 1, 0);
  if (glyph === "!") {
    r(ctx, x + 7, y + 2, 2, 5, 0);
    r(ctx, x + 7, y + 8, 2, 2, 0);
  } else {
    r(ctx, x + 5, y + 2, 6, 8, 0);
    r(ctx, x + 4, y + 3, 8, 6, 0);
    r(ctx, x + 7, y + 3, 2, 1, 4);
    r(ctx, x + 6, y + 4, 1, 4, 4);
    r(ctx, x + 9, y + 4, 1, 4, 4);
    r(ctx, x + 7, y + 6, 2, 1, 4);
  }
}

/** Little twinkle over things not inspected yet. */
export function drawSparkle(ctx: Ctx, x: number, y: number, phase: number) {
  const k = Math.sin(phase);
  if (k < 0) return;
  if (k > 0.6) {
    r(ctx, x + 2, y, 1, 5, 0);
    r(ctx, x, y + 2, 5, 1, 0);
    r(ctx, x + 2, y + 2, 1, 1, 4);
  } else {
    r(ctx, x + 1, y + 1, 3, 3, 0);
    r(ctx, x + 2, y + 2, 1, 1, 4);
  }
}
