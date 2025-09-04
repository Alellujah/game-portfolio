import { useEffect, useRef, useState } from "react";
import Container from "../Container";

export interface BagItem {
  name: string;
  quantity: number;
  description: string;
}

interface ItemMenuProps {
  items: BagItem[];
  onSelect: (item: BagItem | null) => void;
}

function ItemMenu({ items, onSelect }: ItemMenuProps) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const safeIndex = items.length
    ? Math.min(Math.max(0, index), items.length - 1)
    : 0;

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    e.stopPropagation();
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (i + 1) % items.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (items[safeIndex]) onSelect(items[safeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onSelect(null);
    }
  }

  const selected = items[safeIndex];

  return (
    <Container className="w-full bg-white">
      <div
        ref={ref}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        className="w-full border-black bg-white p-2 outline-none"
      >
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li key={it.name} className="mt-2 first:mt-0">
              <button
                onMouseEnter={() => setIndex(i)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(it);
                }}
                className="w-full text-left text-black hover:bg-black hover:text-white px-1"
              >
                <span className="inline-block w-4 mr-2">
                  {i === safeIndex ? "▶" : ""}
                </span>
                <span className="tracking-wider">
                  {it.name} x{it.quantity}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 text-xs text-black min-h-[1.5rem]">
          {selected?.description ?? ""}
        </div>
      </div>
    </Container>
  );
}

export default ItemMenu;

