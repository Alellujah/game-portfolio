import { useEffect, useRef, useState } from "react";
import Container from "../Container";

export interface SwitchMon {
  name: string;
  hp: number;
  maxHp: number;
  index: number;
}

interface SwitchMenuProps {
  mons: SwitchMon[];
  onSelect: (mon: SwitchMon | null) => void;
}

function SwitchMenu({ mons, onSelect }: SwitchMenuProps) {
  const [idx, setIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!mons.length) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => (i - 1 + mons.length) % mons.length);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => (i + 1) % mons.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(mons[idx]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onSelect(null);
    }
  };

  return (
    <Container className="w-full bg-white">
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="w-full border-black bg-white p-2 outline-none"
      >
        <ul className="space-y-1">
          {mons.map((m, i) => (
            <li key={m.index} className="mt-2 first:mt-0">
              <button
                onMouseEnter={() => setIdx(i)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(m);
                }}
                className="w-full text-left text-black hover:bg-black hover:text-white px-1"
              >
                <span className="inline-block w-4 mr-2">
                  {i === idx ? "▶" : ""}
                </span>
                <span className="tracking-wider">{m.name}</span>
                <span className="ml-2 text-xs">
                  {m.hp}/{m.maxHp}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}

export default SwitchMenu;
