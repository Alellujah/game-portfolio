import { useEffect, useState } from "react";
import BattleMessages from "../components/BattleMessages";
import Container from "../components/layout/Container";
import Sprite from "../components/Sprite";
import type { Mon } from "../engine/mons";

type Result = "won" | "lost";

interface Props {
  playerSpriteUrl: string;
  enemySpriteUrl: string;
  result: Result;
  onFinish?: () => void;
  messages?: string[];
  playerMons?: Mon[];
  enemyMons?: Mon[];
  onPlayAgain?: () => void;
  onContact?: () => void;
  contactUrl?: string; // if provided and onContact not set, opens in new tab
}

export default function FinalScene({
  playerSpriteUrl,
  enemySpriteUrl,
  result,
  messages,
  onPlayAgain,
  onContact,
  contactUrl,
}: Props) {
  const defaultMsgs =
    result === "won"
      ? ["Enemy fainted!", "You won the battle!"]
      : ["You fainted...", "Better luck next time!"];
  const msgs = messages && messages.length ? messages : defaultMsgs;
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuIndex, setMenuIndex] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 20);
    const onKey = (e: KeyboardEvent) => {
      if (showMenu) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setMenuIndex((i) => (i - 1 + 2) % 2);
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setMenuIndex((i) => (i + 1) % 2);
          return;
        }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (menuIndex === 0) {
            if (onPlayAgain) onPlayAgain();
            else window.location.reload();
          } else if (menuIndex === 1) {
            if (onContact) onContact();
            else if (contactUrl) window.open(contactUrl, "_blank");
          }
          return;
        }
      } else {
        if (e.key === "Enter" || e.key === " ") {
          if (idx < msgs.length - 1) setIdx((i) => i + 1);
          else setShowMenu(true);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [
    idx,
    msgs.length,
    showMenu,
    menuIndex,
    onPlayAgain,
    onContact,
    contactUrl,
  ]);

  return (
    <div className="bg-stone-200 p-4 mx-auto select-none">
      {/* Enemy side */}
      <div className="grid grid-cols-3 gap-4 items-stretch mb-2">
        <div className="col-span-2" />
        <div
          className={`col-span-1 relative flex flex-col items-end pr-2 transition-all duration-500 ease-out ${
            show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
          }`}
          style={{ minHeight: 140 }}
        >
          <div className="relative mt-1">
            <Sprite spriteUrl={enemySpriteUrl} />
          </div>
        </div>
      </div>

      {/* Player side */}
      <div className="grid grid-cols-3 gap-4 items-stretch">
        <div
          className={`col-span-2 flex flex-col items-start pl-2 transition-all duration-500 ease-out ${
            show ? "opacity-100 -translate-x-0" : "opacity-0 -translate-x-6"
          }`}
        >
          <div className="relative">
            <Sprite spriteUrl={playerSpriteUrl} size={123} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="relative">
        <div className="grid grid-cols-3 gap-4 items-stretch">
          <div className="col-span-3">
            <BattleMessages
              message={msgs[idx]}
              className="w-full h-[104px]"
              waiting={!showMenu}
              speed={24}
              charsPerTick={12}
              autoPageDelay={1800}
            />
          </div>
        </div>
        {/* Final options menu (overlay on top of message pane) */}
        {showMenu && (
          <div className="absolute inset-0 z-10 grid place-items-center">
            <Container fixedWidth className="w-full bg-white">
              <div className="text-black">
                <button
                  className="block w-full text-left py-1"
                  onMouseEnter={() => setMenuIndex(0)}
                  onClick={() =>
                    onPlayAgain ? onPlayAgain() : window.location.reload()
                  }
                >
                  <span className="inline-block w-4 mr-1">
                    {menuIndex === 0 ? "▶" : ""}
                  </span>
                  Play again
                </button>
                <button
                  className="block w-full text-left py-1"
                  onMouseEnter={() => setMenuIndex(1)}
                  onClick={() => {
                    if (onContact) onContact();
                    else if (contactUrl) window.open(contactUrl, "_blank");
                  }}
                >
                  <span className="inline-block w-4 mr-1">
                    {menuIndex === 1 ? "▶" : ""}
                  </span>
                  Send me a message
                </button>
              </div>
            </Container>
          </div>
        )}
      </div>
    </div>
  );
}
