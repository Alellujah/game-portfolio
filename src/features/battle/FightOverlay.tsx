import FightMenu, { type Skill } from "../../components/Menu/FightMenu";

export type FightOverlayProps = {
  moves: {
    name: string;
    power: number;
    type: string;
    pp: number;
    maxPP: number;
  }[];
  onSelect: (skill: Skill | null) => void;
  onCancel: () => void;
};

function FightOverlay({ moves, onSelect, onCancel }: FightOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-30 bottom-0"
      role="dialog"
      aria-modal="true"
      // prevent key events from leaking to the underlying battlefield
      onKeyDown={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/40 z-0"
        aria-label="Close fight menu"
        onClick={onCancel}
      />

      {/* Centered panel */}
      <div className="absolute inset-0 grid place-items-center z-10">
        <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <FightMenu skills={moves} onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
}

export default FightOverlay;
