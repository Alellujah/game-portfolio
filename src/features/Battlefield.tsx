import { useEffect, useState, useRef } from "react";
import useBattleEngine from "../hooks/useBattleEngine";
import MessagesPane from "./battle/MessagesPane";
import BattleMenu from "../components/Menu/BattleMenu";
import type { Mon } from "../engine/mons";
import { wait, SPEED_MULT } from "../utils/pacing";
import ItemsOverlay from "./battle/ItemsOverlay";
import ChangeOverlay from "./battle/ChangeOverlay";
import useHpTween from "../hooks/useHpTween";
import StatusRow from "./battle/StatusRow";
import FightOverlay from "./battle/FightOverlay";

interface Props {
  playerMon: Mon;
  enemyMon: Mon;
  playerParty?: Mon[]; // for CHG menu; includes the active mon
}

export default function Battlefield({
  enemyMon,
  playerMon,
  playerParty,
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
      pp: mv.pp ?? 10,
      maxPP: mv.maxPP ?? mv.pp ?? 10,
    })),
  });

  const engine = useBattleEngine({
    player: toEngineMon(playerMon),
    enemy: toEngineMon(enemyMon),
    playerParty: (playerParty ?? [playerMon]).map(toEngineMon),
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

  const enemyHp = useHpTween(engEnemy.hp);
  const playerHp = useHpTween(engPlayer.hp);

  // Reset displayed HP when active mons change (switch or new battle)
  useEffect(() => {
    enemyHp.reset(engEnemy.hp);
  }, [engEnemy.name]);

  useEffect(() => {
    playerHp.reset(engPlayer.hp);
  }, [engPlayer.name]);

  const [enemyHit, setEnemyHit] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);

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
          const durE = enemyHp.to(e.payload.value as number);
          await wait(durE + Math.round(120 * SPEED_MULT));
          setEnemyHit(false);
        } else if (e.payload.target === "player") {
          // switch to enemy turn visuals while player takes damage
          setPhase("enemyTurn");
          setPlayerHit(true);
          const durP = playerHp.to(e.payload.value as number);
          await wait(durP + Math.round(120 * SPEED_MULT));
          setPlayerHit(false);
        }
        continue;
      }
      if (e.type === "pause") {
        // Let the player press Enter/click to continue to enemy's action
        setLockUI(true); // keep UI locked to avoid menu interaction
        // wait for key/click
        await new Promise<void>((resolve) => {
          const onKey = (ev: KeyboardEvent) => {
            if (ev.key === "Enter" || ev.key === " ") {
              window.removeEventListener("keydown", onKey);
              window.removeEventListener("click", onClick);
              resolve();
            }
          };
          const onClick = () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("click", onClick);
            resolve();
          };
          window.addEventListener("keydown", onKey);
          window.addEventListener("click", onClick);
        });
        // After acknowledgement, run enemy's step
        const followUp = engine.enemyStep();
        await playEvents(followUp);
        return; // upstream call will unlock UI
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
        return "Choose an item.";
      case "chg":
        return "Choose a mon to send out.";
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

  // Derive current player's sprite/back URL from the UI party by matching name
  const uiParty = playerParty ?? [playerMon];
  const activeUiMon =
    uiParty.find((m) => m.name === engPlayer.name) ?? playerMon;

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
      <StatusRow
        side="enemy"
        show={phase !== "start"}
        hit={enemyHit}
        spriteSize={400}
        spriteUrl={enemyMon.spriteFrontUrl}
        status={{
          name: enemyMon.name,
          level: enemyMon.level ?? 1,
          hp: engEnemy.maxHp,
          actualHp: enemyHp.disp,
        }}
      />
      <StatusRow
        side="player"
        show={
          phase === "playerSend" ||
          phase === "playerTurn" ||
          phase === "enemyTurn"
        }
        hit={playerHit}
        spriteUrl={activeUiMon.spriteBackUrl}
        status={{
          name: engPlayer.name,
          level: engPlayer.level ?? playerMon.level ?? 1,
          hp: engPlayer.maxHp,
          actualHp: playerHp.disp,
        }}
      />
      <div className="relative">
        <div className="grid grid-cols-3 gap-4 items-stretch">
          <div className="col-span-2">
            <MessagesPane
              overrideMsg={overrideMsg}
              lastNonEmptyMsg={lastNonEmptyMsg}
              lockUI={lockUI}
              fallback={messages(selectedAction ?? "")}
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
          <FightOverlay
            moves={(engPlayer.moves || []).map((mv: any) => ({
              name: mv.name,
              power: mv.power ?? 10,
              type: mv.type ?? "NORMAL",
              pp: mv.pp ?? 0,
              maxPP: mv.maxPP ?? mv.pp ?? 0,
            }))}
            onCancel={() => setSelectedAction(null)}
            onSelect={async (skill) => {
              // Escape or cancel from menu
              if (!skill) {
                setSelectedAction(null);
                return;
              }
              const idx = (engPlayer.moves || []).findIndex(
                (m: any) => m.name === skill?.name
              );
              if (idx >= 0) {
                lockUIRef.current = true; // Enter guard for same-tick keydown
                setLockUI(true); // pre-lock to avoid Enter race
                setSelectedAction(null);
                const preMsg = `${
                  phase === "playerTurn" ? "Player " : "Enemy "
                }${engPlayer.name} used ${skill?.name}!`;
                setOverrideMsg(preMsg);
                setLastNonEmptyMsg(preMsg);
                const events = engine.doMove(idx);
                await playEvents(events);
              }
            }}
          />
        )}

        {selectedAction === "item" && canInteract && (
          <ItemsOverlay
            inventory={engine.state.inventory}
            onCancel={() => setSelectedAction(null)}
            onSelect={async (key) => {
              if (!key) {
                setSelectedAction(null);
                return;
              }
              lockUIRef.current = true;
              setLockUI(true);
              setSelectedAction(null);
              const events = engine.useItem(key);
              await playEvents(events);
            }}
          />
        )}

        {selectedAction === "chg" && canInteract && (
          <ChangeOverlay
            party={engine.state.player.party}
            activeName={engPlayer.name}
            onCancel={() => setSelectedAction(null)}
            onSelect={async (idx) => {
              if (idx == null) {
                setSelectedAction(null);
                return;
              }
              lockUIRef.current = true;
              setLockUI(true);
              setSelectedAction(null);
              const events = engine.changeMonIndex(idx);
              await playEvents(events);
            }}
          />
        )}
      </div>
    </div>
  );
}
