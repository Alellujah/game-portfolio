import type { Mon } from "../../engine/mons";

type Props = {
  mons: Mon[];
  totalSlots?: number; // default to 6 like classic games
  size?: number; // pixel size of each ball
};

type SlotState = "owned" | "fainted" | "empty";

function PokeballIcon({
  state,
  size = 16,
}: {
  state: SlotState;
  size?: number;
}) {
  const s = Math.max(10, size);
  const isOwned = state === "owned" || state === "fainted";
  const cls =
    state === "empty"
      ? "text-stone-700 opacity-60"
      : state === "fainted"
      ? "text-stone-600"
      : "text-stone-900";
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      aria-hidden
      className={cls}
    >
      {/* Top half fill when filled (classic Pokéball look) */}
      {isOwned && (
        <path
          d="M12 2a10 10 0 0 0-10 10h20A10 10 0 0 0 12 2z"
          fill="currentColor"
        />
      )}
      {/* Outer circle */}
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Center dividing line */}
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
      {/* Center button (white fill for authenticity) */}
      <circle cx="12" cy="12" r="3" fill="#ffffff" stroke="currentColor" strokeWidth="2" />
      {/* Fainted overlay: X cross */}
      {state === "fainted" && (
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </g>
      )}
    </svg>
  );
}

function MonsPreview({ mons, totalSlots = 6, size = 16 }: Props) {
  const items: SlotState[] = Array.from({ length: totalSlots }, (_, i) => {
    if (i < mons.length) {
      const hp = Math.max(0, mons[i]?.hp ?? 0);
      return hp > 0 ? "owned" : "fainted";
    }
    return "empty";
  });

  return (
    <div className="flex items-center gap-1 pl-2 pr-2">
      {items.map((state, idx) => (
        <div
          key={idx}
          className="will-change-transform"
          style={{
            animation: "monspreview-retro-pop 220ms steps(2, end) both",
            animationDelay: `${idx * 60}ms`,
          }}
        >
          <PokeballIcon state={state} size={size} />
        </div>
      ))}
    </div>
  );
}

export default MonsPreview;
