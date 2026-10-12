import * as THREE from "three";

// Procedural pixel-art textures (placeholder art until real tilesets exist).
// Drawn on tiny canvases and sampled with NearestFilter for crisp pixels.

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, rand: () => number) => void,
  repeat?: [number, number],
  seed = 1
) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  draw(ctx, rng(seed));
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
  }
  return tex;
}

const px = (ctx: CanvasRenderingContext2D, c: string, x: number, y: number, w = 1, h = 1) => {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
};

export function woodFloor(repeat: [number, number]) {
  return makeTexture(
    16,
    16,
    (ctx, r) => {
      px(ctx, "#9a6a3c", 0, 0, 16, 16);
      for (let row = 0; row < 4; row++) {
        const y = row * 4;
        px(ctx, "#6e4524", 0, y + 3, 16, 1);
        const seam = (row * 7) % 16;
        px(ctx, "#6e4524", seam, y, 1, 3);
        for (let i = 0; i < 6; i++) {
          px(ctx, r() > 0.5 ? "#a9784a" : "#8a5d33", Math.floor(r() * 16), y + Math.floor(r() * 3), 2, 1);
        }
      }
    },
    repeat
  );
}

export function wallpaper(repeat: [number, number]) {
  return makeTexture(
    16,
    16,
    (ctx) => {
      px(ctx, "#e8dcc0", 0, 0, 16, 16);
      for (let x = 0; x < 16; x += 4) px(ctx, "#d9c9a6", x, 0, 1, 16);
      px(ctx, "#c4ad84", 6, 6, 2, 2);
      px(ctx, "#c4ad84", 14, 14, 2, 2);
    },
    repeat
  );
}

export function wainscot(repeat: [number, number]) {
  return makeTexture(
    16,
    16,
    (ctx) => {
      px(ctx, "#5b6b4a", 0, 0, 16, 16);
      px(ctx, "#4a5a3b", 0, 0, 16, 2);
      px(ctx, "#6d7f5a", 2, 4, 12, 9);
      px(ctx, "#5b6b4a", 3, 5, 10, 7);
    },
    repeat
  );
}

export function rug() {
  return makeTexture(32, 24, (ctx) => {
    px(ctx, "#7a2630", 0, 0, 32, 24);
    px(ctx, "#d9b062", 2, 2, 28, 20);
    px(ctx, "#7a2630", 3, 3, 26, 18);
    px(ctx, "#a33a45", 6, 6, 20, 12);
    for (let i = 0; i < 4; i++) px(ctx, "#d9b062", 10 + i * 4, 11, 2, 2);
  });
}

export function books() {
  return makeTexture(32, 32, (ctx, r) => {
    px(ctx, "#4a2e1a", 0, 0, 32, 32);
    const colors = ["#c0392b", "#2c6e9b", "#d4a017", "#3a7d44", "#8e44ad", "#e67e22", "#ecf0f1", "#34495e"];
    for (let shelf = 0; shelf < 4; shelf++) {
      const y = shelf * 8;
      px(ctx, "#2e1c10", 0, y + 7, 32, 1);
      let x = 1;
      while (x < 31) {
        const w = 1 + Math.floor(r() * 2);
        const h = 4 + Math.floor(r() * 3);
        px(ctx, colors[Math.floor(r() * colors.length)], x, y + 7 - h, w, h);
        x += w + (r() > 0.85 ? 2 : 0);
      }
    }
  }, undefined, 7);
}

export function pragueWindow() {
  return makeTexture(48, 32, (ctx, r) => {
    // dusk sky
    const g = ctx.createLinearGradient(0, 0, 0, 32);
    g.addColorStop(0, "#2b3a78");
    g.addColorStop(0.55, "#e9846b");
    g.addColorStop(1, "#ffd28a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 48, 32);
    px(ctx, "#fff6d0", 36, 6, 3, 3); // moon
    // skyline: rooftops, a castle and spires
    const dark = "#22182e";
    px(ctx, dark, 0, 24, 48, 8);
    for (let x = 0; x < 48; x += 3) px(ctx, dark, x, 21 + Math.floor(r() * 3), 3, 8);
    px(ctx, dark, 6, 14, 10, 10); // castle
    px(ctx, dark, 8, 9, 2, 5);
    px(ctx, dark, 12, 7, 2, 7);
    px(ctx, dark, 12, 5, 1, 2);
    px(ctx, dark, 30, 12, 3, 12); // tyn church spires
    px(ctx, dark, 35, 12, 3, 12);
    px(ctx, dark, 31, 9, 1, 3);
    px(ctx, dark, 36, 9, 1, 3);
    for (let i = 0; i < 14; i++) px(ctx, "#ffd36b", Math.floor(r() * 48), 22 + Math.floor(r() * 9));
    // window frame cross
    px(ctx, "#f4efe4", 23, 0, 2, 32);
    px(ctx, "#f4efe4", 0, 15, 48, 2);
  }, undefined, 3);
}

export function codeScreen() {
  return makeTexture(24, 16, (ctx, r) => {
    px(ctx, "#13233f", 0, 0, 24, 16);
    const cols = ["#7fdbff", "#ffdc73", "#9be564", "#ff8fab"];
    for (let y = 1; y < 15; y += 2) {
      let x = 1 + Math.floor(r() * 3);
      while (x < 22) {
        const w = 1 + Math.floor(r() * 5);
        px(ctx, cols[Math.floor(r() * cols.length)], x, y, Math.min(w, 23 - x), 1);
        x += w + 1;
      }
    }
  }, undefined, 11);
}

export function gameScreen() {
  return makeTexture(24, 16, (ctx) => {
    px(ctx, "#9bbc0f", 0, 0, 24, 16);
    px(ctx, "#8bac0f", 0, 11, 24, 5);
    px(ctx, "#306230", 3, 6, 5, 5);
    px(ctx, "#306230", 15, 2, 5, 5);
    px(ctx, "#0f380f", 1, 13, 22, 2);
  });
}

export function serverFront() {
  return makeTexture(16, 32, (ctx) => {
    px(ctx, "#1d1f24", 0, 0, 16, 32);
    for (let y = 2; y < 30; y += 5) {
      px(ctx, "#2c3038", 1, y, 14, 4);
      for (let x = 7; x < 14; x += 2) px(ctx, "#15171b", x, y + 1, 1, 2);
    }
  });
}

export function whiteboard() {
  return makeTexture(32, 20, (ctx) => {
    px(ctx, "#f7f7f2", 0, 0, 32, 20);
    px(ctx, "#2c3e50", 3, 10, 26, 1); // timeline
    const dots: [number, string][] = [[4, "#c0392b"], [10, "#2980b9"], [16, "#27ae60"], [22, "#8e44ad"], [28, "#e67e22"]];
    for (const [x, c] of dots) {
      px(ctx, c, x - 1, 9, 3, 3);
      px(ctx, "#7f8c8d", x - 2, 4, 5, 1);
      px(ctx, "#95a5a6", x - 2, 14, 4, 1);
    }
  });
}
