import SwitchMenu, { type SwitchMon } from "../../components/Menu/SwitchMenu";

interface Props {
  mons: SwitchMon[];
  onSelect: (mon: SwitchMon | null) => void;
  onCancel: () => void;
}

function SwitchOverlay({ mons, onSelect, onCancel }: Props) {
  return (
    <div
      className="absolute inset-0 z-30"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/40 z-0"
        aria-label="Close change menu"
        onClick={onCancel}
      />
      {/* Centered panel */}
      <div className="absolute inset-0 grid place-items-center z-10 px-4">
        <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <SwitchMenu mons={mons} onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
}

export default SwitchOverlay;
