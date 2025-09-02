import { useMemo, useState } from "react";
import BattleMessages from "../components/BattleMessages";

// Simple HP bar component (monochrome vibe)
function HpBar({ current, max }: { current: number; max: number }) {
  const p = Math.max(0, Math.min(100, Math.round((current / max) * 100)));
  return (
    <div className="h-3 w-40 border-2 border-black bg-white">
      <div className="h-full bg-black" style={{ width: `${p}%` }} />
    </div>
  );
}

const initialPlayer = {
  name: "BLASTOISE",
  level: 45,
  hp: 142,
  maxHp: 147,
};

const initialEnemy = {
  name: "RAPIDASH",
  level: 42,
  hp: 60,
  maxHp: 160,
};

const MOVES = [
  { name: "ICE BEAM", type: "WATER", pp: 10, maxPP: 15, power: 95 },
  { name: "BITE", type: "NORMAL", pp: 25, maxPP: 25, power: 60 },
  { name: "SKULL BASH", type: "NORMAL", pp: 15, maxPP: 15, power: 130 },
  { name: "SURF", type: "WATER", pp: 10, maxPP: 15, power: 90 },
];

export default function Menu() {
  const [selected, setSelected] = useState(0);
  const [message, setMessage] = useState("A WILD DEVELOPER APPEARED!");

  const move = useMemo(() => MOVES[selected], [selected]);

  function handleConfirm() {
    setMessage(`${initialPlayer.name} USED ${move.name}!`);
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-3 text-black font-pokemon">
      {/* Stage (16:10) */}
      <div className="relative aspect-[16/10] border-4 border-black bg-white overflow-hidden">
        {/* ENEMY NAME + HP (top-left) */}
        <div className="absolute top-3 left-3 flex items-center gap-3">
          <div className="text-sm tracking-wider">
            <div>
              {initialEnemy.name}{" "}
              <span className="ml-1">:L{initialEnemy.level}</span>
            </div>
          </div>
          <HpBar current={initialEnemy.hp} max={initialEnemy.maxHp} />
        </div>

        {/* PLAYER NAME + HP (middle-right) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-right">
          <div className="text-sm tracking-wider">
            {initialPlayer.name}{" "}
            <span className="ml-1">:L{initialPlayer.level}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 justify-end">
            <span className="text-xs">
              {initialPlayer.hp}/{initialPlayer.maxHp}
            </span>
            <HpBar current={initialPlayer.hp} max={initialPlayer.maxHp} />
          </div>
        </div>

        {/* BOTTOM PANELS */}
        <div className="absolute left-3 right-3 bottom-3 grid grid-cols-3 gap-3">
          {/* Left column: TYPE and PP boxes stacked */}
          <div className="col-span-1 space-y-2">
            <div className="border-2 border-black p-2">
              <div className="flex justify-between text-xs">
                <span>TYPE/</span>
                <span>{move.type}</span>
              </div>
            </div>
            <div className="border-2 border-black p-2 text-right text-xs">
              {move.pp}/{move.maxPP}
            </div>
          </div>

          {/* Right pane: move list with cursor */}
          <div className="col-span-2 border-2 border-black p-2">
            <ul className="space-y-1">
              {MOVES.map((m, i) => (
                <li key={m.name}>
                  <button
                    onMouseEnter={() => setSelected(i)}
                    onClick={() => {
                      setSelected(i);
                      handleConfirm();
                    }}
                    className={`w-full text-left text-sm px-1 ${
                      i === selected
                        ? "bg-black text-white"
                        : "hover:bg-black hover:text-white"
                    }`}
                  >
                    <span className="inline-block w-4">
                      {i === selected ? "▶" : ""}
                    </span>
                    <span className="tracking-wider">{m.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Message box below stage */}
      <BattleMessages message={message} speed={20} />
    </div>
  );
}
