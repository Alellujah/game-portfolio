import { useCallback, useRef, useState } from "react";
import {
  createBattle,
  performTurn,
  type BattleState,
  type Event as BattleEvent,
  type Mon,
  defaultRng,
  type RNG,
} from "../engine/game";

export type UseBattleEngineOptions = {
  player: Mon;
  enemy: Mon;
  rng?: RNG;
};

export type UseBattleEngine = {
  /** current engine state (immutable snapshot for React) */
  state: BattleState;
  /** convenience shortcuts */
  player: Mon;
  enemy: Mon;
  /** last batch of events from the most recent performTurn */
  lastEvents: BattleEvent[];
  /** append-only log (mirrors state.log) */
  log: string[];
  /** true if battle already ended */
  ended: BattleState["ended"] | undefined;
  /** run player's move by index (0..3). also runs enemy reply if battle not ended */
  doMove: (index: number) => BattleEvent[];
  /** attempt to flee (ends battle immediately) */
  flee: () => BattleEvent[];
  /** reset battle to initial mons */
  reset: () => void;
};

/**
 * React hook wrapper around the engine in `engine/game.tsx`.
 * Keeps a mutable ref to the engine state, and exposes immutable snapshots
 * for React so components re-render correctly.
 */
export default function useBattleEngine(
  opts: UseBattleEngineOptions
): UseBattleEngine {
  const rng = opts.rng ?? defaultRng;

  // Keep the authoritative engine state in a ref (engine mutates it internally)
  const stateRef = useRef<BattleState>(
    createBattle(structuredClone(opts.player), structuredClone(opts.enemy))
  );

  // Local react state mirrors for rendering
  const [stateSnap, setStateSnap] = useState<BattleState>(
    cloneState(stateRef.current)
  );
  const [lastEvents, setLastEvents] = useState<BattleEvent[]>([]);

  const player = stateSnap.player.active;
  const enemy = stateSnap.enemy.active;

  // helper to sync the ref state into a fresh immutable snapshot
  const sync = useCallback(() => {
    setStateSnap(cloneState(stateRef.current));
  }, []);

  const apply = useCallback(
    (events: BattleEvent[]) => {
      setLastEvents(events);
      // stateRef.current is already mutated by performTurn; just sync a snapshot
      sync();
      return events;
    },
    [sync]
  );

  const doMove = useCallback(
    (index: number) => {
      const events = performTurn(
        stateRef.current,
        { kind: "move", index },
        rng
      );
      return apply(events);
    },
    [apply, rng]
  );

  const flee = useCallback(() => {
    const events = performTurn(stateRef.current, { kind: "flee" }, rng);
    return apply(events);
  }, [apply, rng]);

  const reset = useCallback(() => {
    stateRef.current = createBattle(
      structuredClone(opts.player),
      structuredClone(opts.enemy)
    );
    setLastEvents([]);
    sync();
  }, [opts.enemy, opts.player, sync]);

  const ended = stateSnap.ended;

  return {
    state: stateSnap,
    player,
    enemy,
    lastEvents,
    log: stateSnap.log,
    ended,
    doMove,
    flee,
    reset,
  };
}

// ---------- helpers ----------
function cloneState(s: BattleState): BattleState {
  // create a light immutable snapshot for React rendering
  return JSON.parse(JSON.stringify(s)) as BattleState;
}
