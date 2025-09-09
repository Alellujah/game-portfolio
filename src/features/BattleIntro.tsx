import { useEffect, useState } from "react";
import BattleMessages from "../components/BattleMessages";
import Sprite from "../components/Sprite";
import type { Mon } from "../engine/mons";
import MonsPreview from "./battle/MonsPreview";

interface Props {
  playerSpriteUrl: string;
  enemySpriteUrl: string;
  onFinish: () => void;
  messages?: string[]; // optional sequence of messages shown after animations
  playerMons: Mon[];
  enemyMons: Mon[];
}

function BattleIntro({
  playerSpriteUrl,
  enemySpriteUrl,
  onFinish,
  messages,
  playerMons,
  enemyMons,
}: Props) {
  const [enemyIn, setEnemyIn] = useState(false);
  const [playerIn, setPlayerIn] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [exiting, setExiting] = useState(false);

  const fallbackMessages = ["FABIO wants to battle!", "aaa"];
  const msgs = messages && messages.length > 0 ? messages : fallbackMessages;
  const [msgIndex, setMsgIndex] = useState(0);

  // Sequence: enemy slides in → player slides in → message appears
  useEffect(() => {
    const t1 = setTimeout(() => setEnemyIn(true), 200); // start enemy
    const t2 = setTimeout(() => setPlayerIn(true), 800); // then player
    const t3 = setTimeout(() => setShowMessage(true), 1400); // then text
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  function handleFinish() {
    setExiting(true);
    setTimeout(() => {
      onFinish();
    }, 600); // match transition duration
  }

  // Allow advancing only after message is visible
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showMessage) return;
      if (e.key === "Enter" || e.key === " ") {
        if (msgIndex < msgs.length - 1) {
          setMsgIndex((i) => i + 1);
        } else {
          handleFinish();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showMessage, onFinish, msgIndex, msgs.length]);

  return (
    <div
      className="bg-stone-200 p-4 mx-auto select-none"
      onClick={() => {
        if (!showMessage) return;
        if (msgIndex < msgs.length - 1) setMsgIndex((i) => i + 1);
        else handleFinish();
      }}
    >
      {/* Enemy side (top area) — classic top-right placement with platform */}
      <div className="grid grid-cols-3 gap-4 items-stretch mb-2">
        <div className="col-span-2" />
        <div
          className={`col-span-1 relative flex flex-col items-end pr-2 transition-all duration-500 ease-out ${
            exiting
              ? "opacity-0 translate-x-6"
              : enemyIn
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-6"
          }`}
          style={{ minHeight: 140 }}
        >
          <MonsPreview mons={enemyMons} />
          <div className="relative mt-1">
            <Sprite spriteUrl={enemySpriteUrl} />
          </div>
        </div>
      </div>

      {/* Player side (bottom area) — classic bottom-left placement with platform */}
      <div className="grid grid-cols-3 gap-4 items-stretch">
        <div
          className={`col-span-2 flex flex-col items-start pl-2 transition-all duration-500 ease-out ${
            exiting
              ? "opacity-0 -translate-x-6"
              : playerIn
              ? "opacity-100 -translate-x-0"
              : "opacity-0 -translate-x-6"
          }`}
        >
          <MonsPreview mons={playerMons} />
          <div className="relative">
            <Sprite spriteUrl={playerSpriteUrl} size={123} />
          </div>
        </div>
      </div>

      {/* Message appears after sprites enter */}
      <div className="relative">
        <div className="grid grid-cols-3 gap-4 items-stretch">
          <div
            className={`col-span-3 transition-all duration-300 ease-out ${
              exiting
                ? "opacity-0 translate-y-1 scale-95 pointer-events-none"
                : showMessage
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-1 scale-95 pointer-events-none"
            }`}
          >
            <BattleMessages
              autoPageDelay={2000}
              speed={30}
              message={fallbackMessages[0]}
              className="w-full h-[88px]"
              waiting={showMessage && !exiting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattleIntro;
