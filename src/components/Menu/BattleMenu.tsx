import { useState, useEffect, useRef } from "react";
import Container from "../Container";

type BattleMenuProps = {
  disabled?: boolean;
  onSelect: (action: string) => void;
};

const ACTIONS = [
  { label: "FIGHT", value: "fight" },
  { label: "CHG", value: "chg" },
  { label: "ITEM", value: "item" },
  { label: "RUN", value: "run" },
];

function BattleMenu({ onSelect, disabled }: BattleMenuProps) {
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
    <Container>
      <div className="grid grid-cols-2 gap-4">
        {ACTIONS.map((action, idx) => (
          <button
            disabled={disabled}
            key={action.value}
            ref={(el) => {
              btnRefs.current[idx] = el;
            }}
            onClick={() => {
              setSelected(idx);
              onSelect(action.value);
            }}
            className={`relative text-black text-xl font-bold px-2 py-1 transition-none text-left`}
            tabIndex={-1}
          >
            {selected === idx && (
              <span
                style={{
                  position: "absolute",
                  left: -12,
                  top: "50%",
                  transform: "translateY(-60%)",
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
    </Container>
  );
}

export default BattleMenu;
