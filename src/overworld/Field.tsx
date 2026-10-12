import { useEffect, useRef, type RefObject } from "react";
import { BASE_H, BASE_W, SCREEN_H, SCREEN_W } from "../config/ui";
import { DECOR_CELLS, DIRS, INTERACTABLES, MAP_W, RIVAL, type Cell, type Dir } from "./content";
import { controllerPos, frontCell, stepController, type Controller } from "./controller";
import {
  TILE,
  WALL_ROWS,
  cellY,
  drawAnimated,
  drawBubble,
  drawSparkle,
  drawStatic,
} from "./tiles";

// Map is drawn from the back wall (row -2) to the doorway (row 9), plus two
// rows of dark "outside" so the camera can scroll the door area above the dialog box
const MAP_PX_W = MAP_W * TILE;
const MAP_PX_H = (WALL_ROWS + 12) * TILE;

// Sprite sheets: 4x4 frames of 16x24 (rows: down, up, left, right; cols: stand, walk A, stand, walk B)
const FRAME_W = 16;
const FRAME_H = 24;
const FACING_ROW: Record<Dir, number> = { down: 0, up: 1, left: 2, right: 3 };
const AMALIE_SHEET = "/sprites/amalie.png";

// Top (y, in map pixels) where the hint bubble sits over each object
const HINT_TOP: Record<string, number> = {
  window: 4,
  pc: 8,
  shelf: 0,
  rack: 0,
  whiteboard: 47,
  tv: 83,
  phone: 99,
};

const DIR_LIST = Object.keys(DIRS) as Dir[];

function assetUrl(path: string) {
  return path.startsWith("/") ? import.meta.env.BASE_URL + path.slice(1) : path;
}

function centerX(cells: Cell[]) {
  return (cells.reduce((a, c) => a + c[0], 0) / cells.length) * TILE;
}

export type FieldProps = {
  ctrl: RefObject<Controller>;
  amalie: RefObject<Controller>;
  playerWalkable: (cell: Cell) => boolean;
  amalieWalkable: (cell: Cell) => boolean;
  targetAt: (cell: Cell) => string | null;
  onTarget: (id: string | null) => void;
  playerSheet: string;
  rivalSheet: string;
  rivalFacing: Dir;
  rivalAlert: boolean;
  // Hide the interact hint (dialog open, alert or transition running)
  hintsHidden: boolean;
  visited: Set<string>;
};

/**
 * Top-down 2D overworld drawn on a 160x144 canvas (the Game Boy resolution),
 * scaled up with crisp pixels.
 */
export default function Field(props: FieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // The render loop reads the latest props without restarting
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.imageSmoothingEnabled = false;

    const plants = DECOR_CELLS;
    const staticLayer = document.createElement("canvas");
    staticLayer.width = MAP_PX_W;
    staticLayer.height = MAP_PX_H;
    drawStatic(staticLayer.getContext("2d")!, MAP_PX_W, RIVAL[0], plants);

    const images = new Map<string, HTMLImageElement>();
    const sheet = (url: string) => {
      let img = images.get(url);
      if (!img) {
        img = new Image();
        img.src = assetUrl(url);
        images.set(url, img);
      }
      return img.complete && img.naturalWidth ? img : null;
    };

    const ai = { wait: 1.5, burst: 0, dir: "left" as Dir };
    let target: string | null = null;
    let last = performance.now();
    let raf = 0;

    const drawWalker = (c: Controller, url: string, camX: number, camY: number) => {
      const img = sheet(url);
      if (!img) return;
      const [x, z] = controllerPos(c);
      const walking = c.t < 0.5;
      const col = walking ? (c.steps % 2 ? 1 : 3) : 0;
      ctx.drawImage(
        img,
        col * FRAME_W,
        FACING_ROW[c.facing] * FRAME_H,
        FRAME_W,
        FRAME_H,
        Math.round(x * TILE - camX),
        Math.round(cellY(z) - 8 - camY),
        FRAME_W,
        FRAME_H
      );
    };

    const rival: Controller = {
      tile: RIVAL,
      from: RIVAL,
      t: 1,
      stepSeconds: 1,
      facing: "down",
      queued: null,
      held: [],
      locked: true,
      steps: 0,
      turnTimer: 0,
    };

    const frame = (now: number) => {
      const p = latest.current;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const t = now / 1000;
      const player = p.ctrl.current;
      const kid = p.amalie.current;

      /* ----- update ----- */
      stepController(player, dt, p.playerWalkable);

      // Amalie runs around in short bursts, pausing in between
      if (!kid.locked && kid.t >= 1 && kid.turnTimer <= 0) {
        if (ai.burst > 0) {
          kid.queued = ai.dir;
          ai.burst--;
        } else {
          ai.wait -= dt;
          if (ai.wait <= 0) {
            ai.dir = DIR_LIST[Math.floor(Math.random() * DIR_LIST.length)];
            ai.burst = 1 + Math.floor(Math.random() * 4);
            ai.wait = 0.4 + Math.random() * 1.8;
          }
        }
      }
      if (stepController(kid, dt, p.amalieWalkable) === "blocked") ai.burst = 0;

      const nextTarget = player.t >= 1 ? p.targetAt(frontCell(player)) : null;
      if (nextTarget !== target) {
        target = nextTarget;
        p.onTarget(target);
      }
      rival.facing = p.rivalFacing;

      /* ----- camera: follow the player, biased up so the dialog box never hides them ----- */
      const [px, pz] = controllerPos(player);
      const camX = Math.round(
        Math.min(Math.max(px * TILE + 8 - BASE_W / 2, 0), MAP_PX_W - BASE_W)
      );
      const camY = Math.round(
        Math.min(Math.max(cellY(pz) + 8 - BASE_H / 2 + TILE, 0), MAP_PX_H - BASE_H)
      );

      /* ----- draw ----- */
      ctx.fillStyle = "#1c1b1b";
      ctx.fillRect(0, 0, BASE_W, BASE_H);
      ctx.drawImage(staticLayer, -camX, -camY);
      ctx.save();
      ctx.translate(-camX, -camY);
      drawAnimated(ctx, t, plants);
      INTERACTABLES.forEach((it, i) => {
        if (!p.visited.has(it.id))
          drawSparkle(ctx, centerX(it.cells) + 10, HINT_TOP[it.id] + 14, t * 2.4 + i * 1.9);
      });
      ctx.restore();

      // Characters, back to front
      const walkers: [Controller, string][] = [
        [player, p.playerSheet],
        [kid, AMALIE_SHEET],
        [rival, p.rivalSheet],
      ];
      walkers
        .sort((a, b) => controllerPos(a[0])[1] - controllerPos(b[0])[1])
        .forEach(([c, url]) => drawWalker(c, url, camX, camY));

      // Bubbles. Over an NPC the bubble would cover a player standing right
      // above them, so it shifts to the side in that case.
      const bob = Math.floor(t * 4) % 2;
      const npcBubbleX = (x: number, z: number) =>
        Math.abs(px - x) < 0.5 && pz < z ? x * TILE + 12 : x * TILE;
      if (p.rivalAlert) {
        drawBubble(
          ctx,
          npcBubbleX(RIVAL[0], RIVAL[1]) - camX,
          cellY(RIVAL[1]) - 22 - camY - bob,
          "!"
        );
      } else if (target && !p.hintsHidden) {
        let bx: number;
        let by: number;
        if (target === "rival") {
          bx = npcBubbleX(RIVAL[0], RIVAL[1]);
          by = cellY(RIVAL[1]) - 22;
        } else if (target === "amalie") {
          const [kx, kz] = controllerPos(kid);
          bx = npcBubbleX(kx, kz);
          by = cellY(kz) - 15;
        } else {
          const it = INTERACTABLES.find((i) => i.id === target)!;
          bx = centerX(it.cells);
          by = HINT_TOP[target];
        }
        drawBubble(ctx, Math.round(bx - camX), Math.round(by - camY - bob), "A");
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={BASE_W}
      height={BASE_H}
      style={{ width: SCREEN_W, height: SCREEN_H, imageRendering: "pixelated" }}
    />
  );
}
