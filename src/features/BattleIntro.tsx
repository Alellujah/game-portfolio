import { useEffect, useState } from "react";
import BattleMessages from "../components/BattleMessages";
import Sprite from "../components/Sprite";

interface Props {
  playerSpriteUrl: string;
  enemySpriteUrl: string;
  onFinish: () => void;
  messages?: string[]; // optional sequence of messages shown after animations
}

function BattleIntro({
  playerSpriteUrl,
  enemySpriteUrl,
  onFinish,
  messages,
}: Props) {
  const [enemyIn, setEnemyIn] = useState(false);
  const [playerIn, setPlayerIn] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [exiting, setExiting] = useState(false);

  const fallbackMessages = [
    "A wild developer appeared! (press Enter)",
    "He looks ready to code!",
    "And kick some ass!",
  ];
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
      className="bg-stone-200 p-4 max-w-4xl mx-auto select-none"
      onClick={() => {
        if (!showMessage) return;
        if (msgIndex < msgs.length - 1) setMsgIndex((i) => i + 1);
        else handleFinish();
      }}
    >
      {/* Enemy side (top row) */}
      <div className="grid grid-cols-3 gap-4 items-stretch mb-4">
        <div
          className={`col-span-2 flex justify-end transition-all duration-500 ease-out ${
            exiting
              ? "opacity-0 translate-x-6"
              : enemyIn
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-6"
          }`}
        >
          <Sprite spriteUrl={enemySpriteUrl} size={132} />
        </div>
      </div>

      {/* Player side (second row) */}
      <div className="grid grid-cols-3 gap-4 items-stretch">
        <div
          className={`col-span-2 justify-center flex transition-all duration-500 ease-out ${
            exiting
              ? "opacity-0 -translate-x-6"
              : playerIn
              ? "opacity-100 -translate-x-0"
              : "opacity-0 -translate-x-6"
          }`}
        >
          <Sprite spriteUrl={playerSpriteUrl} size={132} />
        </div>
      </div>

      {/* Message appears after sprites enter */}
      <div className="relative mt-2">
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
              message={showMessage ? msgs[msgIndex] : ""}
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattleIntro;
