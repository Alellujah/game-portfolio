import { useEffect, useState, useRef } from "react";
import useBattleEngine from "../hooks/useBattleEngine";
import BattleMessages from "../components/BattleMessages";
import BattleMenu from "../components/Menu/BattleMenu";
import Sprite from "../components/Sprite";
import StatusBar from "../components/StatusBar";
import FightMenu from "../components/Menu/FightMenu";
import type { Mon } from "../engine/mons";

// tiny sleep helper
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

// global pacing multiplier (higher = slower animations)
const SPEED_MULT = 2.0; // global pacing (higher = slower)

interface Props {
  playerMon: Mon;
  enemyMon: Mon;
  playerMons: Mon[];
  enemyMons: Mon[];
}

export default function Battlefield({
  enemyMon,
  enemyMons,
  playerMon,
  playerMons,
}: Props) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Bridge mons to engine shape (fallback stats if missing)
  const toEngineMon = (m: Mon) => ({
    name: m.name,
    level: (m as any).level ?? 5,
    hp: m.hp, // current HP starts full
    maxHp: (m as any).maxHp ?? m.hp,
    attack: (m as any).attack ?? 50,
    defense: (m as any).defense ?? 50,
    speed: (m as any).speed ?? 50,
    moves: (m.moves || []).map((mv: any) => ({
      name: mv.name,
      power: mv.power ?? 10,
      accuracy: mv.accuracy ?? 95,
    })),
  });

  const engine = useBattleEngine({
    player: toEngineMon(playerMon),
    enemy: toEngineMon(enemyMon),
  });

  // Convenience aliases for rendering
  const engPlayer = engine.player;
  const engEnemy = engine.enemy;

  // --- Animation / presentation state ---
  const [lockUI, setLockUI] = useState(false); // disables interactions while animating
  const lockUIRef = useRef(lockUI);
  useEffect(() => {
    lockUIRef.current = lockUI;
  }, [lockUI]);
  const [dispEnemyHp, setDispEnemyHp] = useState(engEnemy.hp);
  const [dispPlayerHp, setDispPlayerHp] = useState(engPlayer.hp);

  const dispEnemyHpRef = useRef(dispEnemyHp);
  const dispPlayerHpRef = useRef(dispPlayerHp);
  useEffect(() => {
    dispEnemyHpRef.current = dispEnemyHp;
  }, [dispEnemyHp]);
  useEffect(() => {
    dispPlayerHpRef.current = dispPlayerHp;
  }, [dispPlayerHp]);

  useEffect(() => {
    setDispEnemyHp(engEnemy.hp);
    setDispPlayerHp(engPlayer.hp);
  }, [enemyMon.name, playerMon.name]);

  const [enemyHit, setEnemyHit] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);

  // tween helper for HP bars (linear, slow)
  function tweenHp(
    from: number,
    to: number,
    setter: (v: number) => void,
    duration?: number
  ) {
    const d = duration ?? 1800; // slower default tween
    const start = performance.now();
    const diff = to - from;
    const decreasing = diff < 0;

    function step(now: number) {
      const t = Math.min(1, (now - start) / d);
      const value = from + diff * t; // linear
      // round towards target without jumps
      if (decreasing) setter(Math.max(to, Math.floor(value)));
      else setter(Math.min(to, Math.ceil(value)));
      if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function hpTweenDuration(from: number, to: number, maxHp: number) {
    const delta = Math.abs(from - to);
    // constant pace: ~50ms por HP; clamp 1200–3500ms (before SPEED_MULT)
    const base = Math.max(1200, Math.min(3500, Math.round(delta * 50)));
    return Math.round(base * SPEED_MULT);
  }

  // Play a batch of engine events with timing + small sprite feedback
  async function playEvents(evts: any[]) {
    if (!evts || evts.length === 0) return;
    setLockUI(true);
    for (const e of evts) {
      if (e.type === "message") {
        setOverrideMsg(e.payload);
        await wait(Math.round(1000 * SPEED_MULT));
        continue;
      }
      if (e.type === "hp") {
        if (e.payload.target === "enemy") {
          setEnemyHit(true);
          const fromE = dispEnemyHpRef.current;
          const toE = e.payload.value as number;
          const durE = hpTweenDuration(fromE, toE, engEnemy.maxHp);
          tweenHp(fromE, toE, setDispEnemyHp, durE);
          await wait(durE + Math.round(120 * SPEED_MULT));
          setEnemyHit(false);
        } else if (e.payload.target === "player") {
          // switch to enemy turn visuals while player takes damage
          setPhase("enemyTurn");
          setPlayerHit(true);
          const fromP = dispPlayerHpRef.current;
          const toP = e.payload.value as number;
          const durP = hpTweenDuration(fromP, toP, engPlayer.maxHp);
          tweenHp(fromP, toP, setDispPlayerHp, durP);
          await wait(durP + Math.round(120 * SPEED_MULT));
          setPlayerHit(false);
        }
        continue;
      }
      if (e.type === "end") {
        setOverrideMsg(e.payload);
        // decide result from engine.state
        if (engine.ended === "won") setPhase("won");
        else if (engine.ended === "lost") setPhase("lost");
        await wait(800);
      }
    }
    // if battle not ended, return to player's turn and unlock UI
    if (!engine.ended) {
      setPhase("playerTurn");
      setOverrideMsg(null); // fallback to prompt on your turn
    }
    setLockUI(false);
  }

  type Phase =
    | "start"
    | "enemySend"
    | "playerSend"
    | "playerTurn"
    | "enemyTurn"
    | "won"
    | "lost";
  const [phase, setPhase] = useState<Phase>("start");
  const [overrideMsg, setOverrideMsg] = useState<string | null>(
    "Fábio wants to fight!"
  );

  // keep last non-empty message to avoid blanks during transitions
  const [lastNonEmptyMsg, setLastNonEmptyMsg] = useState<string>("");
  useEffect(() => {
    if (overrideMsg != null && overrideMsg.trim() !== "") {
      setLastNonEmptyMsg(overrideMsg);
    }
  }, [overrideMsg]);

  const messages = (action: string) => {
    switch (action) {
      case "item":
        return "You have no items.";
      case "chg":
        return "No one to change, you're alone mate.";
      case "run":
        return "Can't ghost this time!";
      default:
        return "What will you do?";
    }
  };

  useEffect(() => {
    if (!selectedAction) return;
    if (phase !== "playerTurn") return; // ignore menu text during intro
    setOverrideMsg(null); // ensure we show the action message below
  }, [selectedAction, phase]);

  function advance() {
    if (phase === "start") {
      setPhase("enemySend");
      setOverrideMsg(`Fábio sends ${enemyMon.name}!`);
      return;
    }
    if (phase === "enemySend") {
      setPhase("playerSend");
      setOverrideMsg(`I trust in you ${playerMon.name}!`);
      return;
    }
    if (phase === "playerSend") {
      setPhase("playerTurn");
      setOverrideMsg(null);
      return;
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (lockUIRef.current || overrideMsg === "") return; // don't allow skipping while animating/handshaking
      if (
        phase === "start" ||
        phase === "enemySend" ||
        phase === "playerSend"
      ) {
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, enemyMon.name, playerMon.name, lockUI, overrideMsg]);

  const [menuEnabled, setMenuEnabled] = useState(false);

  useEffect(() => {
    // Disable menu by default on phase changes
    setMenuEnabled(false);
    if (phase === "playerTurn") {
      setSelectedAction(null); // clear any stale selection like 'fight'
      const t = setTimeout(
        () => setMenuEnabled(true),
        Math.round(400 * SPEED_MULT)
      );
      return () => clearTimeout(t);
    }
  }, [phase]);

  const canInteract = phase === "playerTurn" && menuEnabled && !lockUI;

  // Whenever the engine emits messages (after player/enemy actions), show the last one
  useEffect(() => {
    if (lockUI) return; // animations control text
    if (phase !== "enemyTurn") return; // only mirror engine text during enemy's turn
    const lastMsg = engine.lastEvents
      .filter((e) => e.type === "message" || e.type === "end")
      .at(-1) as any;
    if (lastMsg) setOverrideMsg(lastMsg.payload);
  }, [engine.lastEvents, phase, lockUI]);

  return (
    <div
      className="bg-stone-200 p-4 max-w-4xl mx-auto"
      onClick={() => {
        if (lockUIRef.current || overrideMsg === "") return;
        if (
          phase === "start" ||
          phase === "enemySend" ||
          phase === "playerSend"
        )
          advance();
      }}
    >
      <div className="grid grid-cols-3 gap-4 items-stretch mb-4">
        <div
          className={`col-span-1 flex items-start transition-all duration-500 ${
            phase === "start"
              ? "opacity-0 -translate-x-6"
              : phase === "enemySend"
              ? "opacity-100 translate-x-0"
              : "opacity-100 translate-x-0"
          }`}
        >
          <StatusBar
            hp={engEnemy.maxHp}
            actualHp={dispEnemyHp}
            level={enemyMon.level ?? 1}
            name={enemyMon.name}
          />
        </div>
        <div
          className={`col-span-2 flex justify-center transition-all duration-500 ${
            phase === "start"
              ? "opacity-0 scale-95"
              : phase === "enemySend"
              ? "opacity-100 scale-100"
              : "opacity-100 scale-100"
          } ${enemyHit ? "animate-hit" : ""}`}
        >
          <Sprite spriteUrl={enemyMon.spriteFrontUrl} size={132} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 items-stretch">
        <div
          className={`col-span-2 justify-center flex transition-all duration-500 ${
            phase === "playerSend" ||
            phase === "playerTurn" ||
            phase === "enemyTurn"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-6"
          } ${playerHit ? "animate-hit" : ""}`}
        >
          <Sprite spriteUrl={playerMon.spriteBackUrl} size={132} />
        </div>
        <div
          className={`col-span-1 flex items-end transition-all duration-500 ${
            phase === "playerSend" ||
            phase === "playerTurn" ||
            phase === "enemyTurn"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-6"
          }`}
        >
          <StatusBar
            hp={engPlayer.maxHp}
            actualHp={dispPlayerHp}
            level={playerMon.level ?? 1}
            name={playerMon.name}
          />
        </div>
      </div>
      <div className="relative">
        <div className="grid grid-cols-3 gap-4 items-stretch">
          <div className="col-span-2">
            <BattleMessages
              message={
                overrideMsg && overrideMsg.trim() !== ""
                  ? overrideMsg
                  : lockUI
                  ? lastNonEmptyMsg
                  : messages(selectedAction ?? "")
              }
              className="h-full"
            />
          </div>
          <div
            className={`col-span-1 ${
              !canInteract ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <BattleMenu onSelect={(action) => setSelectedAction(action)} />
          </div>
        </div>

        {selectedAction === "fight" && canInteract && (
          <>
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-black/40 z-20"
              onClick={() => setSelectedAction(null)}
            />
            {/* overlayed fight menu */}
            <div className="absolute inset-0 z-30 grid place-items-center">
              <div className="w-full">
                <FightMenu
                  skills={(engPlayer.moves || []).map((mv: any) => ({
                    name: mv.name,
                    power: mv.power ?? 10,
                    type: mv.type ?? "NORMAL",
                    pp: mv.pp ?? 10,
                    maxPP: mv.pp ?? 10,
                  }))}
                  onSelect={async (skill) => {
                    const idx = (engPlayer.moves || []).findIndex(
                      (m) => m.name === skill?.name
                    );
                    if (idx >= 0) {
                      lockUIRef.current = true; // Enter guard for same-tick keydown
                      setLockUI(true); // pre-lock to avoid Enter race
                      setSelectedAction(null);
                      // Pre-fill the attack message to avoid any blank frame
                      const preMsg = `${playerMon.name} used ${skill?.name}!`;
                      setOverrideMsg(preMsg);
                      setLastNonEmptyMsg(preMsg);
                      const events = engine.doMove(idx);
                      await playEvents(events);
                    }
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
