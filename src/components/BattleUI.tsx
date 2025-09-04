import { useEffect, useRef, useState } from "react";

// ---------------- Types ----------------
export type Move = {
  name: string;
  power: number; // 0 for status
  pp?: number;
  accuracy?: number; // 0..100 (default 100)
};

export type Mon = {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  moves: Move[]; // up to 4
};

export type BattleUIProps = {
  player: Mon;
  enemy: Mon;
  onEnd?: (result: "win" | "lose" | "flee") => void;
  playerSpriteSrc?: string; // default /player.png
  enemySpriteSrc?: string; // default /enemy.png
};

// ---------------- Helpers ----------------
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function percent(n: number, d: number) {
  return clamp(Math.round((n / d) * 100), 0, 100);
}

function rng(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// very light damage calc (arcade)
function calcDamage(power: number, level: number) {
  const base = Math.round(power * (level / 10));
  const variance = rng(0, Math.max(1, Math.round(power / 4)));
  return Math.max(1, base + variance);
}

// ---------------- Components ----------------
function HpBar({ hp, max }: { hp: number; max: number }) {
  const p = percent(hp, max);
  const bar = p > 50 ? "bg-green-500" : p > 20 ? "bg-yellow-400" : "bg-red-500";
  return (
    <div className="w-full h-2 bg-slate-700 rounded overflow-hidden">
      <div
        className={`h-2 ${bar} transition-[width] duration-300`}
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-green-950/70 border border-green-900 shadow-inner p-3">
      {children}
    </div>
  );
}

// Small sprite placeholders (you can replace with real images later)
function EnemySprite({ hurt, src }: { hurt: boolean; src: string }) {
  return (
    <img
      src={src}
      alt="enemy"
      className={`w-24 h-24 object-contain ${hurt ? "animate-pulse" : ""}`}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

function PlayerSprite({ hurt, src }: { hurt: boolean; src: string }) {
  return (
    <img
      src={src}
      alt="player"
      className={`w-24 h-24 object-contain ${hurt ? "animate-pulse" : ""}`}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// ---------------- Battle UI ----------------
export default function BattleUI({
  player,
  enemy,
  onEnd,
  playerSpriteSrc = "/player.png",
  enemySpriteSrc = "/bat.png",
}: BattleUIProps) {
  const [p, setP] = useState(player);
  const [e, setE] = useState(enemy);
  const [phase, setPhase] = useState<
    "intro" | "player-select" | "player-anim" | "enemy-anim" | "resolve" | "end"
  >("intro");
  const [log, setLog] = useState<string[]>(["A batalha começou!"]);
  const [hurtEnemy, setHurtEnemy] = useState(false);
  const [hurtPlayer, setHurtPlayer] = useState(false);
  const [disabled, setDisabled] = useState(false);

  // Focus for key shortcuts
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  // Intro → Player turn
  useEffect(() => {
    if (phase === "intro") {
      const t = setTimeout(() => setPhase("player-select"), 500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Key shortcuts 1..4 and F to flee
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled) return;
      if (phase !== "player-select") return;
      if (e.key >= "1" && e.key <= "4") {
        const idx = parseInt(e.key, 10) - 1;
        if (p.moves[idx]) doPlayerMove(idx);
      } else if (e.key === "f" || e.key === "F") {
        end("flee");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, p.moves, disabled]);

  function pushLog(line: string) {
    setLog((L) => [...L.slice(-3), line]);
  }

  function end(result: "win" | "lose" | "flee") {
    setPhase("end");
    pushLog(
      result === "win"
        ? "🎉 Vitória!"
        : result === "lose"
        ? "💀 Foste à vida…"
        : "🏃 Fugiste!"
    );
    const t = setTimeout(() => onEnd?.(result), 700);
    return () => clearTimeout(t);
  }

  function doPlayerMove(i: number) {
    const move = p.moves[i];
    if (!move) return;
    setDisabled(true);
    setPhase("player-anim");
    const miss = (move.accuracy ?? 100) < rng(1, 100);
    if (miss) {
      pushLog(`${p.name} falhou ${move.name}!`);
      setTimeout(() => enemyTurn(), 500);
      return;
    }
    const dmg = move.power > 0 ? calcDamage(move.power, p.level) : 0;
    pushLog(`${p.name} usou ${move.name}!`);
    setHurtEnemy(true);
    setTimeout(() => {
      setE((E) => ({ ...E, hp: clamp(E.hp - dmg, 0, E.maxHp) }));
      setHurtEnemy(false);
      if (e.hp - dmg <= 0) {
        end("win");
      } else {
        enemyTurn();
      }
    }, 400);
  }

  function enemyTurn() {
    setPhase("enemy-anim");
    const choices = e.moves.filter(Boolean);
    const move = choices[rng(0, Math.max(0, choices.length - 1))] ?? {
      name: "Tackle",
      power: 8,
    };
    const miss = (move.accuracy ?? 100) < rng(1, 100);
    if (miss) {
      pushLog(`${e.name} falhou ${move.name}!`);
      return backToPlayer();
    }
    const dmg = move.power > 0 ? calcDamage(move.power, e.level) : 0;
    pushLog(`${e.name} usou ${move.name}!`);
    setHurtPlayer(true);
    setTimeout(() => {
      setP((P) => ({ ...P, hp: clamp(P.hp - dmg, 0, P.maxHp) }));
      setHurtPlayer(false);
      if (p.hp - dmg <= 0) {
        end("lose");
      } else {
        backToPlayer();
      }
    }, 400);
  }

  function backToPlayer() {
    setDisabled(false);
    setPhase("player-select");
    pushLog("O que vais fazer?");
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      <div
        ref={rootRef}
        tabIndex={0}
        className="relative aspect-[16/10] rounded-3xl border border-green-900 bg-[linear-gradient(180deg,#1a2f12,#1a2f12_58%,#0e1e0b_58%,#0e1e0b)] shadow-2xl overflow-hidden"
      >
        {/* Enemy side */}
        <div className="absolute top-4 left-4 right-4 grid grid-cols-2">
          <div className="col-start-1 flex items-start gap-3">
            <div
              className={`transition-transform ${
                hurtEnemy ? "-translate-x-1" : ""
              }`}
            >
              <EnemySprite hurt={hurtEnemy} src={enemySpriteSrc} />
            </div>
          </div>
          <div className="col-start-2 justify-self-end w-56">
            <Box>
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{e.name}</span>
                <span>Lv{e.level}</span>
              </div>
              <HpBar hp={e.hp} max={e.maxHp} />
            </Box>
          </div>
        </div>

        {/* Player side */}
        <div className="absolute bottom-28 left-4 right-4 grid grid-cols-2 items-end">
          <div className="col-start-1 w-56">
            <Box>
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{p.name}</span>
                <span>Lv{p.level}</span>
              </div>
              <HpBar hp={p.hp} max={p.maxHp} />
            </Box>
          </div>
          <div className="col-start-2 justify-self-end flex items-end gap-3">
            <div
              className={`transition-transform ${
                hurtPlayer ? "translate-x-1" : ""
              }`}
            >
              <PlayerSprite hurt={hurtPlayer} src={playerSpriteSrc} />
            </div>
          </div>
        </div>
      </div>

      {/* Actions & Log below stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Actions */}
        <Box>
          <div className="grid grid-cols-2 gap-2">
            {p.moves.slice(0, 4).map((m, i) => (
              <button
                key={i}
                disabled={phase !== "player-select" || disabled || !m}
                onClick={() => doPlayerMove(i)}
                className="p-2 rounded-lg bg-green-950/80 border border-green-900 hover:bg-green-900/60 disabled:opacity-50 text-left text-sm"
              >
                <div className="flex items-center justify-between">
                  <span>{m?.name ?? "—"}</span>
                  <kbd className="text-xs text-green-400/80">{i + 1}</kbd>
                </div>
                <div className="text-xs text-green-300/60">
                  Power {m?.power ?? 0}
                </div>
              </button>
            ))}
            <button
              disabled={phase !== "player-select" || disabled}
              onClick={() => end("flee")}
              className="p-2 rounded-lg bg-green-950/80 border border-green-900 hover:bg-green-900/60 disabled:opacity-50 text-left text-sm col-span-2"
            >
              Fugir
            </button>
          </div>
        </Box>

        {/* Log */}
        <Box>
          <div className="min-h-16 text-sm whitespace-pre-wrap">
            {log.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        </Box>
      </div>
    </div>
  );
}

// ---------------- Minimal example data ----------------
// eslint-disable-next-line react-refresh/only-export-components
export const DemoPlayer: Mon = {
  name: "Fábio",
  level: 12,
  hp: 86,
  maxHp: 86,
  moves: [
    { name: "React Strike", power: 14 },
    { name: "Next.js Beam", power: 18, accuracy: 90 },
    { name: "UX Polish", power: 8 },
    { name: "Docker Slam", power: 12 },
  ],
};

// eslint-disable-next-line react-refresh/only-export-components
export const DemoEnemy: Mon = {
  name: "Bug Report",
  level: 10,
  hp: 72,
  maxHp: 72,
  moves: [
    { name: "Null Ref", power: 10 },
    { name: "Timeout", power: 12, accuracy: 85 },
    { name: "Memory Leak", power: 6 },
    { name: "Linter Error", power: 8 },
  ],
};
