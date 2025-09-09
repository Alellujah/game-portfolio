import Container from "../../components/layout/Container";
import { useEffect, useMemo, useRef, useState } from "react";
import { setKeyTarget, getKeyTarget } from "../../utils/inputTarget";
import type { ItemKey } from "../../engine/game";

const ITEMS: { key: ItemKey; name: string; desc: string }[] = [
  { key: "coffee", name: "Coffee", desc: "+2 PP to all moves" },
  { key: "beer", name: "Beer", desc: "+35 HP" },
  { key: "cigarette", name: "Cigarette", desc: "+10 HP" },
  { key: "7days", name: "7Days", desc: "+60 HP" },
];

export type ItemsOverlayProps = {
  onSelect: (key: ItemKey | null) => void;
  onCancel: () => void;
  inventory?: Record<ItemKey, number>;
};

export default function ItemsOverlay({
  onSelect,
  onCancel,
  inventory,
}: ItemsOverlayProps) {
  const [index, setIndex] = useState(0);
  const idx = useMemo(
    () => Math.max(0, Math.min(index, ITEMS.length - 1)),
    [index]
  );
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    ref.current?.focus();
    setKeyTarget(ref.current);
    return () => {
      // Only clear if we were the active target
      if (getKeyTarget() === ref.current) setKeyTarget(null);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 z-30"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        className="absolute inset-0 bg-black/40 z-0"
        aria-label="Close items"
        onClick={onCancel}
      />
      <div className="absolute inset-0 grid place-items-center z-10 px-4">
        <Container
          className="w-full max-w-md bg-white"
          style={{ position: "absolute", bottom: 0 }}
        >
          <div
            ref={ref}
            tabIndex={0}
            className="outline-none p-2"
            onKeyDown={(e) => {
              if (e.key === "ArrowUp")
                setIndex((i) => (i - 1 + ITEMS.length) % ITEMS.length);
              if (e.key === "ArrowDown")
                setIndex((i) => (i + 1) % ITEMS.length);
              if (e.key === "Enter" || e.key === " ") onSelect(ITEMS[idx].key);
              if (e.key === "Escape") onSelect(null);
            }}
          >
            <div className="text-black text-sm mb-2">Select an item:</div>
            <ul>
              {ITEMS.map((it, i) => {
                const count = inventory?.[it.key] ?? 0;
                const disabled = count <= 0;
                return (
                  <li key={it.key} className="mt-1 first:mt-0">
                    <button
                      className={`w-full text-left px-1 ${
                        disabled
                          ? "text-black/50 cursor-not-allowed"
                          : "text-black hover:bg-black hover:text-white"
                      }`}
                      disabled={disabled}
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => !disabled && onSelect(it.key)}
                    >
                      <span className="inline-block w-4 mr-2">
                        {i === idx ? "▶" : ""}
                      </span>
                      <span className="font-bold mr-2">{it.name}</span>
                      <span className="text-xs opacity-80 mr-2">{it.desc}</span>
                      <span className="text-xs">x{count}</span>
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
