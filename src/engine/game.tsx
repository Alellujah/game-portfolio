export function calculateDamage(
  attackerLevel: number,
  attackerAttack: number,
  defenderDefense: number,
  movePower: number
): number {
  const baseDamage =
    (((2 * attackerLevel) / 5 + 2) *
      movePower *
      (attackerAttack / defenderDefense)) /
      50 +
    2;
  const randomFactor = Math.random() * (1 - 0.85) + 0.85; // Random factor between 0.85 and 1
  return Math.floor(baseDamage * randomFactor);
}

export function applyItemEffect(
  item: string,
  currentHp: number,
  maxHp: number
): number {
  switch (item) {
    case "Snickers Bar":
      return Math.min(currentHp + 20, maxHp);
    case "Beer":
      return Math.min(currentHp + 50, maxHp);
    case "Shot of Vodka":
      return Math.min(currentHp + 200, maxHp);
    case "Good Night Sleep":
      return maxHp;
    default:
      return currentHp; // No effect if item is unknown
  }
}

// --- Battle engine types and functions ---

export interface Mon {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  moves: Move[];
}

export interface Move {
  name: string;
  power: number;
  accuracy: number;
  type?: string;
  pp: number; // current PP
  maxPP: number; // maximum PP
}

export interface BattleState {
  player: { active: Mon; party: Mon[]; pendingSwitchIndex?: number };
  enemy: { active: Mon; party: Mon[]; pendingSwitchIndex?: number };
  turn: "player" | "enemy";
  ended?: "won" | "lost";
  log: string[];
  inventory: Record<ItemKey, number>;
}

export interface Event {
  type: "message" | "hp" | "end" | "pause" | "forceChange";
  payload: any;
}

export interface TurnAction {
  kind: "move" | "flee" | "item" | "change";
  index?: number; // for move or change (party index)
  itemKey?: ItemKey; // for item
  newMon?: Mon; // for change (legacy)
  skipEnemy?: boolean; // if true on change, do not schedule enemy reply
}

export type RNG = () => number;
export const defaultRng: RNG = () => Math.random();

/** create a fresh battle */
export function createBattle(
  player: Mon,
  enemy: Mon,
  playerParty?: Mon[],
  enemyParty?: Mon[]
): BattleState {
  const party = (playerParty && playerParty.length ? playerParty : [player]).slice();
  // ensure the active is a reference from the party array (so HP/PP persist)
  const active = party.find((m) => m.name === player.name) ?? party[0];
  // Enemy party support
  const eParty = (enemyParty && enemyParty.length ? enemyParty : [enemy]).slice();
  const eActive = eParty.find((m) => m.name === enemy.name) ?? eParty[0];
  return {
    player: { active, party },
    enemy: { active: eActive, party: eParty },
    turn: "player",
    log: [],
    inventory: { coffee: 2, beer: 2, cigarette: 3, "7days": 1 },
  };
}

// --- Items ---
export type ItemKey = "coffee" | "beer" | "cigarette" | "7days";

type ItemDef = {
  name: string;
  hp: number; // HP restored (flat)
  pp: number; // PP restored for each move (flat)
};

export const ITEMS: Record<ItemKey, ItemDef> = {
  // Only COFFEE restores PP; others restore HP only
  coffee: { name: "Coffee", hp: 0, pp: 2 },
  beer: { name: "Beer", hp: 35, pp: 0 },
  cigarette: { name: "Cigarette", hp: 10, pp: 0 },
  "7days": { name: "7Days", hp: 60, pp: 0 },
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function funnyItemMessage(
  key: ItemKey,
  monName: string,
  hpGain: number,
  ppGainPerMove: number
): string {
  const N = monName.toUpperCase();
  const parts: string[] = [];
  if (hpGain > 0) parts.push(`HP +${hpGain}`);
  if (ppGainPerMove > 0) parts.push(`PP +${ppGainPerMove} to all moves`);
  const eff = parts.length ? ` ${parts.join(", ")}.` : 
    ` It didn't seem to do much...`;
  switch (key) {
    case "beer":
      return `${N} just chugged a BEER in 5s!${eff}`;
    case "coffee":
      return `${N} downed a COFFEE shot! Eyes wide open.${eff}`;
    case "cigarette":
      return `${N} lit a CIGARETTE... questionable buff.${eff}`;
    case "7days":
      return `${N} pulled a 7 DAYS crunch! Somehow revived.${eff}`;
    default:
      return `${N} used an item.${eff}`;
  }
}

/** simplistic AI: choose first available move */
export function enemyAI(state: BattleState): TurnAction {
  const mon = state.enemy.active;
  if (!mon.moves || mon.moves.length === 0) {
    return { kind: "move", index: 0 };
  }
  const idx = Math.floor(Math.random() * mon.moves.length);
  return { kind: "move", index: idx };
}

/** perform a turn for the player (and possibly enemy) */
export function performTurn(
  state: BattleState,
  action: TurnAction,
  rng: RNG = defaultRng
): Event[] {
  const events: Event[] = [];
  const player = state.player.active;
  const enemy = state.enemy.active;

  if (state.ended) return events;

  if (action.kind === "flee") {
    state.ended = "lost";
    events.push({ type: "end", payload: "You fled!" });
    return events;
  }

  if (action.kind === "item" && action.itemKey) {
    const def = ITEMS[action.itemKey];
    if (def) {
      // consume from inventory if available
      const left = state.inventory[action.itemKey] ?? 0;
      if (left <= 0) {
        events.push({ type: "message", payload: `No ${def.name} left!` });
      } else {
        state.inventory[action.itemKey] = left - 1;
        const beforeHp = player.hp;
        // restore HP if any
        if (def.hp > 0) player.hp = clamp(player.hp + def.hp, 0, player.maxHp);
        // restore PP for each move
        if (def.pp > 0) {
          for (const mv of player.moves || []) {
            mv.pp = clamp(mv.pp + def.pp, 0, mv.maxPP);
          }
        }
        const hpGain = player.hp - beforeHp;
        const funny = funnyItemMessage(action.itemKey, player.name, hpGain, def.pp);
        events.push({ type: "message", payload: funny });
        // emit HP event only if changed to avoid redundant bars
        if (hpGain !== 0) {
          events.push({ type: "hp", payload: { target: "player", value: player.hp } });
        }
      }
    } else {
      events.push({ type: "message", payload: `Nothing happened...` });
    }
    // After using an item, pause to let player read before enemy acts
    events.push({ type: "pause", payload: "continue" });
    // Do not process enemy action here; the UI will trigger enemy step after pause
    state.turn = "enemy";
    state.log.push(
      ...events.map((e) => (e.type === "message" || e.type === "end" ? e.payload : ""))
    );
    return events;
  }

  if (action.kind === "change") {
    const prev = player.name;
    if (typeof action.index === "number") {
      const idx = Math.max(0, Math.min(action.index, state.player.party.length - 1));
      const candidate = state.player.party[idx];
      if (candidate && candidate.name !== prev && candidate.hp > 0) {
        if (action.skipEnemy) {
          // Immediate switch used after faint — no enemy reply
          state.player.active = candidate;
          events.push({ type: "message", payload: `Go, ${candidate.name.toUpperCase()}!` });
          events.push({ type: "hp", payload: { target: "player", value: state.player.active.hp, reason: "switch" } });
          state.turn = "player";
          state.log.push(
            ...events.map((e) => (e.type === "message" || e.type === "end" ? e.payload : ""))
          );
          return events;
        } else {
          // Defer the actual switch until UI acknowledges pause
          state.player.pendingSwitchIndex = idx;
          events.push({ type: "message", payload: `Come back, ${prev.toUpperCase()}!` });
          // Auto-advance this pause after a short timeout; no user confirm needed here
          // Require player to press Enter/click to continue
          events.push({ type: "pause", payload: "continue" });
          state.turn = "enemy";
          state.log.push(
            ...events.map((e) => (e.type === "message" || e.type === "end" ? e.payload : ""))
          );
          return events;
        }
      } else {
        // Invalid switch: do not consume the player's turn
        events.push({ type: "message", payload: `Can't switch to that mon right now.` });
        state.turn = "player";
        state.log.push(
          ...events.map((e) => (e.type === "message" || e.type === "end" ? e.payload : ""))
        );
        return events;
      }
    } else if (action.newMon) {
      // legacy direct mon switch (no party binding) — still defer
      const idx = state.player.party.findIndex((m) => m.name === action.newMon?.name);
      if (idx >= 0) state.player.pendingSwitchIndex = idx;
      events.push({ type: "message", payload: `Come back, ${prev.toUpperCase()}!` });
      // Require player to press Enter/click to continue
          events.push({ type: "pause", payload: "continue" });
      state.turn = "enemy";
      state.log.push(
        ...events.map((e) => (e.type === "message" || e.type === "end" ? e.payload : ""))
      );
      return events;
    }
  }

  if (action.kind === "move" && action.index !== undefined) {
    const move = player.moves[action.index];
    if (!move) {
      // invalid index, do nothing but consume turn
    } else if (move.pp <= 0) {
      events.push({ type: "message", payload: `${move.name} has no PP left!` });
    } else if (rng() <= (move.accuracy ?? 100) / 100) {
      // consume PP
      move.pp = clamp(move.pp - 1, 0, move.maxPP);
      const dmg = calculateDamage(
        player.level,
        player.attack,
        enemy.defense,
        move.power
      );
      enemy.hp = Math.max(0, enemy.hp - dmg);
      events.push({
        type: "message",
        payload: `Player ${player.name.toUpperCase()} used ${move.name.toUpperCase()}!`,
      });
      events.push({
        type: "hp",
        payload: { target: "enemy", value: enemy.hp },
      });
      if (enemy.hp <= 0) {
        // If there is another enemy mon available, schedule a switch via pending index
        const nextIdx = state.enemy.party.findIndex(
          (m) => m.hp > 0 && m.name !== enemy.name
        );
        if (nextIdx >= 0) {
          // Announce faint, then add a short auto pause; UI will call enemyStep which will perform the switch
          events.push({ type: "message", payload: `Enemy ${enemy.name.toUpperCase()} fainted!` });
          // Require player to press Enter/click to continue
          events.push({ type: "pause", payload: "continue" });
          state.enemy.pendingSwitchIndex = nextIdx;
          state.turn = "player";
          state.log.push(
            ...events.map((e) => (e.type === "message" || e.type === "end" ? e.payload : ""))
          );
          return events;
        } else {
          state.ended = "won";
          events.push({ type: "end", payload: "Enemy fainted! You win!" });
          return events;
        }
      }
    } else {
      events.push({
        type: "message",
        payload: `Player ${player.name.toUpperCase()}'s attack missed!`,
      });
    }
  }

  // Enemy's turn if still alive
  if (!state.ended) {
    const enemyAction = enemyAI(state);
    if (enemyAction.kind === "move" && enemyAction.index !== undefined) {
      const move = enemy.moves[enemyAction.index];
      if (!move) {
        // no-op
      } else if (move.pp <= 0) {
        events.push({
          type: "message",
          payload: `Enemy ${enemy.name.toUpperCase()} has no PP for ${move.name}!`,
        });
      } else if (rng() <= (move.accuracy ?? 100) / 100) {
        move.pp = clamp(move.pp - 1, 0, move.maxPP);
        const dmg = calculateDamage(
          enemy.level,
          enemy.attack,
          player.defense,
          move.power
        );
        player.hp = Math.max(0, player.hp - dmg);
        events.push({
          type: "message",
          payload: `Enemy ${enemy.name.toUpperCase()} used ${move.name.toUpperCase()}!`,
        });
        events.push({
          type: "hp",
          payload: { target: "player", value: player.hp },
        });
        if (player.hp <= 0) {
          // If player has another healthy mon, force a change instead of ending
          const hasAnother = state.player.party.some(
            (m) => m.hp > 0 && m.name !== player.name
          );
          if (hasAnother) {
            events.push({
              type: "message",
              payload: `Player ${player.name.toUpperCase()} fainted!`,
            });
            events.push({ type: "forceChange", payload: true });
            state.turn = "player";
          } else {
            state.ended = "lost";
            events.push({
              type: "end",
              payload: `Player ${player.name.toUpperCase()} fainted! You lose!`,
            });
          }
        }
      } else {
        events.push({
          type: "message",
          payload: `Enemy ${enemy.name.toUpperCase()}'s attack missed!`,
        });
      }
    }
  }

  state.turn = "player";
  state.log.push(
    ...events.map((e) =>
      e.type === "message" || e.type === "end" ? e.payload : ""
    )
  );
  return events;
}

/** Run only the enemy's action (used after a pause like item usage) */
export function enemyStep(state: BattleState, rng: RNG = defaultRng): Event[] {
  const events: Event[] = [];
  if (state.ended) return events;
  // If there is a pending switch from the player, apply it now and announce
  if (state.player.pendingSwitchIndex != null) {
    const idx = state.player.pendingSwitchIndex;
    state.player.pendingSwitchIndex = undefined;
    const candidate = state.player.party[idx];
    if (candidate) {
      state.player.active = candidate;
      events.push({ type: "message", payload: `Go, ${candidate.name.toUpperCase()}!` });
      // Sync UI HP to new active before any damage animation
      events.push({ type: "hp", payload: { target: "player", value: state.player.active.hp, reason: "switch" } });
      // Pause here so user confirms after seeing GO message; enemy acts on next step
      events.push({ type: "pause", payload: "continue" });
      return events;
    }
  }
  // If there is a pending switch from the enemy (scheduled after faint), apply it now
  if (state.enemy.pendingSwitchIndex != null) {
    const idx = state.enemy.pendingSwitchIndex;
    state.enemy.pendingSwitchIndex = undefined;
    const candidate = state.enemy.party[idx];
    if (candidate) {
      state.enemy.active = candidate;
      events.push({
        type: "message",
        payload: `Enemy sends ${candidate.name.toUpperCase()}!`,
      });
      // Sync UI HP to new active before any subsequent action
      events.push({
        type: "hp",
        payload: { target: "enemy", value: state.enemy.active.hp, reason: "switch" },
      });
      // No enemy action this step; return so UI shows message and waits
      return events;
    }
  }
  const player = state.player.active;
  const enemy = state.enemy.active;
  const enemyAction = enemyAI(state);
  if (enemyAction.kind === "move" && enemyAction.index !== undefined) {
    const move = enemy.moves[enemyAction.index];
    if (!move) {
      // no-op
    } else if (move.pp <= 0) {
      events.push({
        type: "message",
        payload: `Enemy ${enemy.name.toUpperCase()} has no PP for ${move.name}!`,
      });
    } else if (rng() <= (move.accuracy ?? 100) / 100) {
      move.pp = clamp(move.pp - 1, 0, move.maxPP);
      const dmg = calculateDamage(
        enemy.level,
        enemy.attack,
        player.defense,
        move.power
      );
      player.hp = Math.max(0, player.hp - dmg);
      events.push({
        type: "message",
        payload: `Enemy ${enemy.name.toUpperCase()} used ${move.name.toUpperCase()}!`,
      });
      events.push({ type: "hp", payload: { target: "player", value: player.hp } });
      if (player.hp <= 0) {
        // If there is another mon available, force a switch instead of ending
        const hasAnother = state.player.party.some((m) => m.hp > 0 && m.name !== player.name);
        if (hasAnother) {
          events.push({ type: "message", payload: `Player ${player.name.toUpperCase()} fainted!` });
          events.push({ type: "forceChange", payload: true });
          state.turn = "player";
        } else {
          state.ended = "lost";
          events.push({ type: "end", payload: `Player ${player.name.toUpperCase()} fainted! You lose!` });
        }
      }
    } else {
      events.push({
        type: "message",
        payload: `Enemy ${enemy.name.toUpperCase()}'s attack missed!`,
      });
    }
  }

  state.turn = "player";
  state.log.push(
    ...events.map((e) => (e.type === "message" || e.type === "end" ? e.payload : ""))
  );
  return events;
}
