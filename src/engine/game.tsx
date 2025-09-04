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

type TypeChartEntry = { weak: string[]; resist: string[] };

const TYPE_CHART: Record<string, TypeChartEntry> = {
  NORMAL: { weak: ["FIGHTING"], resist: [] },
  FIGHTING: { weak: ["PSYCHIC", "FLYING"], resist: ["BUG", "STEEL"] },
  PSYCHIC: { weak: ["BUG"], resist: ["FIGHTING"] },
  STEEL: { weak: ["FIGHTING"], resist: ["NORMAL", "BUG", "FLYING"] },
  ELECTRIC: { weak: ["DRAGON"], resist: ["FLYING", "STEEL"] },
  DRAGON: { weak: ["DRAGON"], resist: ["ELECTRIC"] },
  BUG: { weak: ["FLYING"], resist: ["FIGHTING", "PSYCHIC"] },
  FLYING: { weak: ["ELECTRIC"], resist: ["BUG", "FIGHTING"] },
  GHOST: { weak: ["GHOST"], resist: ["BUG", "NORMAL"] },
};

export function getTypeEffectiveness(
  attackType: string | undefined,
  defenderType: string
): number {
  if (!attackType) return 1;
  const chart = TYPE_CHART[defenderType];
  if (chart?.weak.includes(attackType)) return 2;
  if (chart?.resist.includes(attackType)) return 0.5;
  return 1;
}

export interface Mon {
  name: string;
  type: string;
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
  payload: unknown;
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

function determineOrder(
  player: Mon,
  enemy: Mon,
  rng: RNG
): ("player" | "enemy")[] {
  if (player.speed > enemy.speed) return ["player", "enemy"];
  if (enemy.speed > player.speed) return ["enemy", "player"];
  return rng() < 0.5 ? ["player", "enemy"] : ["enemy", "player"];
}

function canDoubleAttack(attacker: Mon, defender: Mon, rng: RNG): boolean {
  if (attacker.speed >= defender.speed * 2) return true;
  const chance =
    Math.max(0, attacker.speed - defender.speed) /
    (attacker.speed + defender.speed);
  return rng() < chance;
}

function performAttack(
  state: BattleState,
  attacker: Mon,
  defender: Mon,
  move: Move | undefined,
  attackerLabel: "player" | "enemy",
  events: Event[],
  rng: RNG
): boolean {
  if (!move) return false;
  if (rng() <= (move.accuracy ?? 100) / 100) {
    const base = calculateDamage(
      attacker.level,
      attacker.attack,
      defender.defense,
      move.power
    );
    const mult = getTypeEffectiveness(move.type, defender.type);
    const dmg = Math.floor(base * mult);
    defender.hp = Math.max(0, defender.hp - dmg);
    events.push({
      type: "message",
      payload: `${attacker.name} used ${move.name}!`,
    });
    if (mult > 1) {
      events.push({ type: "message", payload: "It's super effective!" });
    } else if (mult < 1) {
      events.push({
        type: "message",
        payload: "It's not very effective...",
      });
    }
    const target = attackerLabel === "player" ? "enemy" : "player";
    events.push({ type: "hp", payload: { target, value: defender.hp } });
    if (defender.hp <= 0) {
      state.ended = attackerLabel === "player" ? "won" : "lost";
      events.push({
        type: "end",
        payload:
          target === "enemy"
            ? "Enemy fainted! You win!"
            : `${state.player.active.name} fainted! You lose!`,
      });
      return true;
    }
  } else {
    events.push({
      type: "message",
      payload: `${attacker.name}'s attack missed!`,
    });
  }
  return false;
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

  const playerMoveIdx = action.kind === "move" ? action.index : undefined;
  const enemyAction = enemyAI(state);
  const enemyMoveIdx =
    enemyAction.kind === "move" ? enemyAction.index : undefined;

  const order = determineOrder(player, enemy, rng);

  for (const who of order) {
    const attacker = who === "player" ? player : enemy;
    const defender = who === "player" ? enemy : player;
    const moveIdx = who === "player" ? playerMoveIdx : enemyMoveIdx;
    const move = attacker.moves[moveIdx ?? 0];
    const fainted = performAttack(
      state,
      attacker,
      defender,
      move,
      who,
      events,
      rng
    );
    if (fainted) break;
    if (canDoubleAttack(attacker, defender, rng)) {
      events.push({
        type: "message",
        payload: `${attacker.name} strikes again!`,
      });
      if (performAttack(state, attacker, defender, move, who, events, rng)) {
        break;
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
