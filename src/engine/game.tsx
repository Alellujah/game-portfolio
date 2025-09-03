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
  pp?: number;
}

export interface BattleState {
  player: { active: Mon };
  enemy: { active: Mon };
  turn: "player" | "enemy";
  ended?: "won" | "lost";
  log: string[];
}

export interface Event {
  type: "message" | "hp" | "end";
  payload: any;
}

export interface TurnAction {
  kind: "move" | "flee";
  index?: number;
}

export type RNG = () => number;
export const defaultRng: RNG = () => Math.random();

/** create a fresh battle */
export function createBattle(player: Mon, enemy: Mon): BattleState {
  return {
    player: { active: player },
    enemy: { active: enemy },
    turn: "player",
    log: [],
  };
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

  if (action.kind === "move" && action.index !== undefined) {
    const move = player.moves[action.index];
    if (move && rng() <= (move.accuracy ?? 100) / 100) {
      const dmg = calculateDamage(
        player.level,
        player.attack,
        enemy.defense,
        move.power
      );
      enemy.hp = Math.max(0, enemy.hp - dmg);
      events.push({
        type: "message",
        payload: `${player.name} used ${move.name}!`,
      });
      events.push({
        type: "hp",
        payload: { target: "enemy", value: enemy.hp },
      });
      if (enemy.hp <= 0) {
        state.ended = "won";
        events.push({ type: "end", payload: "Enemy fainted! You win!" });
        return events;
      }
    } else {
      events.push({
        type: "message",
        payload: `${player.name}'s attack missed!`,
      });
    }
  }

  // Enemy's turn if still alive
  if (!state.ended) {
    const enemyAction = enemyAI(state);
    if (enemyAction.kind === "move" && enemyAction.index !== undefined) {
      const move = enemy.moves[enemyAction.index];
      if (move && rng() <= (move.accuracy ?? 100) / 100) {
        const dmg = calculateDamage(
          enemy.level,
          enemy.attack,
          player.defense,
          move.power
        );
        player.hp = Math.max(0, player.hp - dmg);
        events.push({
          type: "message",
          payload: `${enemy.name} used ${move.name}!`,
        });
        events.push({
          type: "hp",
          payload: { target: "player", value: player.hp },
        });
        if (player.hp <= 0) {
          state.ended = "lost";
          events.push({
            type: "end",
            payload: `${player.name} fainted! You lose!`,
          });
        }
      } else {
        events.push({
          type: "message",
          payload: `${enemy.name}'s attack missed!`,
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
