import { DIRS, type Cell, type Dir } from "./content";

// Mutable movement state shared between the React layer (input) and the
// render loop (useFrame). Kept outside React state to avoid re-rendering
// on every step.
export type Controller = {
  tile: Cell;
  from: Cell;
  // 0..1 progress of the current step
  t: number;
  stepSeconds: number;
  facing: Dir;
  // One-shot step requests (mobile buttons, key taps, NPC AI)
  queued: Dir | null;
  // Directions currently held on a physical keyboard, most recent last
  held: Dir[];
  locked: boolean;
  // Total steps taken (alternates the walking foot)
  steps: number;
  // Short pause after turning in place, so a tap turns without walking
  turnTimer: number;
};

export const PLAYER_STEP_SECONDS = 0.22;
// Holding a new direction longer than this walks; a quicker tap only turns (~8 frames, like Gen 1)
const TURN_PAUSE = 0.14;

export function createController(
  spawn: Cell,
  stepSeconds = PLAYER_STEP_SECONDS,
  facing: Dir = "down"
): Controller {
  return {
    tile: spawn,
    from: spawn,
    t: 1,
    stepSeconds,
    facing,
    queued: null,
    held: [],
    locked: false,
    steps: 0,
    turnTimer: 0,
  };
}

export function frontCell(c: Controller): Cell {
  const [dx, dz] = DIRS[c.facing];
  return [c.tile[0] + dx, c.tile[1] + dz];
}

// Interpolated world position
export function controllerPos(c: Controller): [number, number] {
  return [
    c.from[0] + (c.tile[0] - c.from[0]) * c.t,
    c.from[1] + (c.tile[1] - c.from[1]) * c.t,
  ];
}

export function occupies(c: Controller, cell: Cell) {
  const at = (p: Cell) => p[0] === cell[0] && p[1] === cell[1];
  return at(c.tile) || (c.t < 1 && at(c.from));
}

/**
 * Advances movement. Returns "moved" when a new step starts, "blocked" when
 * the requested direction is not walkable, or null otherwise.
 */
export function stepController(
  c: Controller,
  dt: number,
  walkable: (cell: Cell) => boolean
): "moved" | "blocked" | null {
  // Leftover time from a finished step carries into the next one, so
  // continuous walking has no stutter between tiles.
  let carry = 0;
  if (c.t < 1) {
    c.t += dt / c.stepSeconds;
    if (c.t < 1) return null;
    carry = c.t - 1;
    c.t = 1;
  } else if (c.turnTimer > 0) {
    c.turnTimer -= dt;
    return null;
  }
  if (c.locked) return null;

  const dir = c.queued ?? c.held[c.held.length - 1] ?? null;
  c.queued = null;
  if (!dir) return null;

  // Standing still and pressing a new direction: turn first (Gen 1 feel)
  if (carry === 0 && dir !== c.facing) {
    c.facing = dir;
    c.turnTimer = TURN_PAUSE;
    return null;
  }

  c.facing = dir;
  const [dx, dz] = DIRS[dir];
  const next: Cell = [c.tile[0] + dx, c.tile[1] + dz];
  if (!walkable(next)) return "blocked";
  c.from = c.tile;
  c.tile = next;
  c.t = Math.min(carry, 0.5);
  c.steps++;
  return "moved";
}
