import type { Mon } from "../../engine/mons";

function MonsPreview({ mons }: { mons: Mon[] }) {
  return (
    <div className="flex space-x-2">
      {mons.map((m, idx) => (
        <div
          key={idx}
          className="w-10 h-10 border-2 border-gray-400 rounded-full bg-white flex items-center justify-center"
        >
          {m.spriteFrontUrl ? (
            <img
              src={m.spriteFrontUrl}
              alt={m.name}
              className="max-w-full max-h-full"
            />
          ) : (
            <span className="text-xs text-gray-500">No Sprite</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default MonsPreview;
