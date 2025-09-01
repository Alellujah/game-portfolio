import { useState, useEffect, useRef } from "react";

type BattleMenuProps = {
  onSelect: (action: string) => void;
};

const ACTIONS = [
  { label: "FIGHT", value: "fight" },
  { label: "PKMN", value: "pkmn" },
  { label: "ITEM", value: "item" },
  { label: "RUN", value: "run" },
];

function BattleMenu({ onSelect }: BattleMenuProps) {
  const [selected, setSelected] = useState(0);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) {
        setSelected((prev) => (prev - 2 + ACTIONS.length) % ACTIONS.length);
      }
      if (["ArrowDown", "s", "S"].includes(e.key)) {
        setSelected((prev) => (prev + 2) % ACTIONS.length);
      }
      if (["ArrowLeft", "a", "A"].includes(e.key)) {
        setSelected((prev) => (prev % 2 === 0 ? prev + 1 : prev - 1));
      }
      if (["ArrowRight", "d", "D"].includes(e.key)) {
        setSelected((prev) => (prev % 2 === 0 ? prev + 1 : prev - 1));
      }
      if (e.key === "Enter" || e.key === " ") {
        onSelect(ACTIONS[selected].value);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, onSelect]);

  return (
    <div className="relative inline-block border-4 border-black bg-[#f8e9f8] p-4">
      <div className="grid grid-cols-2 gap-4">
        {ACTIONS.map((action, idx) => (
          <button
            key={action.value}
            ref={(el) => {
              btnRefs.current[idx] = el;
            }}
            onClick={() => {
              setSelected(idx);
              onSelect(action.value);
            }}
            className={`relative text-black text-xl font-bold px-2 py-1 transition-none align-left`}
            tabIndex={-1}
          >
            {selected === idx && (
              <span
                style={{
                  position: "absolute",
                  left: -18,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "1.2em",
                  color: "black",
                  fontWeight: "bold",
                }}
              >
                ▶
              </span>
            )}
            {action.label}
          </button>
        ))}
      </div>
      {/* Decorative corners */}
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 8,
          height: 8,
          borderLeft: "4px solid black",
          borderTop: "4px solid black",
        }}
      />
      <span
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 8,
          height: 8,
          borderRight: "4px solid black",
          borderTop: "4px solid black",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: 8,
          height: 8,
          borderLeft: "4px solid black",
          borderBottom: "4px solid black",
        }}
      />
      <span
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: 8,
          height: 8,
          borderRight: "4px solid black",
          borderBottom: "4px solid black",
        }}
      />
    </div>
  );
}

export default BattleMenu;
