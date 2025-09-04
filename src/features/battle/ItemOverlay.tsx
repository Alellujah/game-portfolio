import ItemMenu, { type BagItem } from "../../components/Menu/ItemMenu";

export type ItemOverlayProps = {
  items: BagItem[];
  onSelect: (item: BagItem | null) => void;
  onCancel: () => void;
};

function ItemOverlay({ items, onSelect, onCancel }: ItemOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-30"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        className="absolute inset-0 bg-black/40 z-0"
        aria-label="Close item menu"
        onClick={onCancel}
      />

      <div className="absolute inset-0 grid place-items-center z-10 px-4">
        <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <ItemMenu items={items} onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
}

export default ItemOverlay;

