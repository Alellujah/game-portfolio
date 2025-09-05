import Container from "../../components/layout/Container";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Mon as EngineMon } from "../../engine/game";

export type ChangeOverlayProps = {
  party: EngineMon[];
  activeName: string;
  onSelect: (index: number | null) => void;
  onCancel: () => void;
};

export default function ChangeOverlay({
  party,
  activeName,
  onSelect,
  onCancel,
}: ChangeOverlayProps) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  const idx = useMemo(
    () => Math.max(0, Math.min(index, party.length - 1)),
    [index, party.length]
  );

  return (
    <div
      className="absolute inset-0 z-30"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        className="absolute inset-0 bg-black/40 z-0"
        aria-label="Close change menu"
        onClick={onCancel}
      />
      <div className="absolute inset-0 grid place-items-center z-10 px-4">
        <Container className="w-full max-w-md bg-white">
          <div
            ref={ref}
            tabIndex={0}
            className="outline-none p-2"
            onKeyDown={(e) => {
              if (e.key === "ArrowUp")
                setIndex((i) => (i - 1 + party.length) % party.length);
              if (e.key === "ArrowDown")
                setIndex((i) => (i + 1) % party.length);
              if (e.key === "Enter" || e.key === " ") onSelect(idx);
              if (e.key === "Escape") onSelect(null);
            }}
          >
            <div className="text-black text-sm mb-2">Choose your mon:</div>
            <ul>
              {party.map((m, i) => {
                const isActive = m.name === activeName;
                const fainted = m.hp <= 0;
                return (
                  <li key={`${m.name}-${i}`} className="mt-1 first:mt-0">
                    <button
                      className={`w-full text-left px-1 ${
                        isActive || fainted
                          ? "text-black/50 cursor-not-allowed"
                          : "text-black hover:bg-black hover:text-white"
                      }`}
                      disabled={isActive || fainted}
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => !(isActive || fainted) && onSelect(i)}
                    >
                      <span className="inline-block w-4 mr-2">
                        {i === idx ? "▶" : ""}
                      </span>
                      <span className="font-bold mr-2">{m.name}</span>
                      <span className="text-xs opacity-80">
                        Lv {m.level ?? 1} • HP {m.hp}
                      </span>
                      {isActive && (
                        <span className="ml-2 text-[10px] opacity-70">
                          (ACTIVE)
                        </span>
                      )}
                      {fainted && (
                        <span className="ml-2 text-[10px] opacity-70">
                          (FAINTED)
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </div>
    </div>
  );
}
