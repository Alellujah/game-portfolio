import { useEffect, useMemo, useRef, useState } from "react";
import Container from "../layout/Container";

export interface Skill {
  name: string;
  power: number;
  type: string; // e.g., WATER, FIRE, NORMAL (UPPERCASE recommended)
  pp: number;
  maxPP: number;
}

interface FightMenuProps {
  skills: Skill[];
  onSelect: (skill: Skill | null) => void;
}

/**
 * Pokémon Red/Blue–style Fight Menu
 * - Right pane: list of moves with a ▶ cursor
 * - Left pane: TYPE and PP boxes for the selected move
 * - Keyboard: Arrow Up/Down to navigate, Enter to confirm
 */
function FightMenu({ skills, onSelect }: FightMenuProps) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const safeIndex = useMemo(() => {
    if (!skills.length) return 0;
    return Math.min(Math.max(0, index), skills.length - 1);
  }, [index, skills.length]);

  const selected = skills[safeIndex];

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // Trap navigation inside the FightMenu
    e.stopPropagation();
    if (!skills.length) return;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (i - 1 + skills.length) % skills.length);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (i + 1) % skills.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (skills[safeIndex]) onSelect(skills[safeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onSelect(null);
    }
  }

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
    <Container className="w-full bg-white">
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        className="w-full border-black bg-white p-2 outline-none"
      >
        <div className="grid grid-cols-3 gap-2">
          {/* LEFT: info boxes */}
          <div className="col-span-1 space-y-1">
            {/* TYPE box */}
            <div className="border-2 border-black p-2 leading-none">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-black">TYPE/</span>
                <span className="text-xs text-black">
                  {selected?.type ?? "—"}
                </span>
              </div>
            </div>
            {/* PP box */}
            <div className="border-2 border-black p-2 flex justify-end">
              <span className="text-xs text-black text-right w-full">
                {selected ? `${selected.pp}/${selected.maxPP}` : "—/—"}
              </span>
            </div>
          </div>

          {/* RIGHT: move list with cursor */}
          <div className="col-span-2 border-2 border-black p-2">
            <ul className="space-y-1">
              {skills.map((s, i) => {
                const isSel = i === safeIndex;
                const out = (s.pp ?? 0) <= 0;
                return (
                  <li key={i} className="mt-2 first:mt-0">
                    <button
                      onMouseEnter={() => setIndex(i)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(s);
                      }}
                      className={`w-full text-left px-1 ${
                        out
                          ? "text-black/50 cursor-not-allowed"
                          : "text-black hover:bg-black hover:text-white"
                      }`}
                    >
                      <span className="inline-block w-4 mr-2">
                        {isSel ? "▶" : ""}
                      </span>
                      <span className="tracking-wider">{s.name}</span>
                      {out && (
                        <span className="ml-2 text-[10px] opacity-70">(NO PP)</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default FightMenu;
