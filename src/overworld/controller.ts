import { DIRS, type Cell, type Dir } from "./content";

// Mutable movement state shared between the React layer (input) and the
// render loop (useFrame). Kept outside React state to avoid re-rendering
// on every step.
export type Controller = {
  tile: Cell;
  from: Cell;
  // 0..1 progress of the current step
  t: number;
  facing: Dir;
  // One-shot step requests (mobile buttons, key repeat)
  queued: Dir | null;
  // Directions currently held on a physical keyboard, most recent last
  held: Dir[];
  locked: boolean;
};

export const STEP_SECONDS = 0.2;

export function createController(spawn: Cell): Controller {
  return {
    tile: spawn,
    from: spawn,
    t: 1,
    facing: "down",
    queued: null,
    held: [],
    locked: true,
  };
}

export function frontCell(c: Controller): Cell {
  const [dx, dz] = DIRS[c.facing];
  return [c.tile[0] + dx, c.tile[1] + dz];
}

export function stepController(
  c: Controller,
  dt: number,
  walkable: (cell: Cell) => boolean
) {
  if (c.t < 1) c.t = Math.min(1, c.t + dt / STEP_SECONDS);
  if (c.t < 1 || c.locked) return;

  const dir = c.queued ?? c.held[c.held.length - 1] ?? null;
  c.queued = null;
  if (!dir) return;

  c.facing = dir;
  const [dx, dz] = DIRS[dir];
  const next: Cell = [c.tile[0] + dx, c.tile[1] + dz];
  if (walkable(next)) {
    c.from = c.tile;
    c.tile = next;
    c.t = 0;
  }
}
