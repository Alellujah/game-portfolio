import Sprite from "../../components/Sprite";
import StatusBar from "../../components/StatusBar";

export type StatusRowProps = {
  side: "enemy" | "player";
  show: boolean;
  hit?: boolean;
  spriteUrl: string;
  status: { name: string; level: number; hp: number; actualHp: number };
  spriteSize?: number; // optional, defaults to 132
};

function StatusRow({
  side,
  show,
  hit,
  spriteUrl,
  status,
  spriteSize = 132,
}: StatusRowProps) {
  const isEnemy = side === "enemy";

  return (
    <div
      className={`grid grid-cols-3 gap-4 items-stretch ${
        isEnemy ? "mb-4" : ""
      }`}
    >
      {isEnemy ? (
        <>
          {/* Enemy status on the left, sprite on the right */}
          <div
            className={`col-span-1 flex items-start transition-all duration-500 ${
              show ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
            }`}
          >
            <StatusBar
              hp={status.hp}
              actualHp={status.actualHp}
              level={status.level}
              name={status.name}
            />
          </div>
          <div
            className={`col-span-2 flex justify-center transition-all duration-500 ${
              show ? "opacity-100 scale-100" : "opacity-0 scale-95"
            } ${hit ? "animate-hit" : ""}`}
          >
            <Sprite spriteUrl={spriteUrl} size={spriteSize} />
          </div>
        </>
      ) : (
        <>
          {/* Player sprite on the left, status on the right */}
          <div
            className={`col-span-2 justify-center flex transition-all duration-500 ${
              show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
            } ${hit ? "animate-hit" : ""}`}
          >
            <Sprite spriteUrl={spriteUrl} size={spriteSize} />
          </div>
          <div
            className={`col-span-1 flex items-end transition-all duration-500 ${
              show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
            }`}
          >
            <StatusBar
              hp={status.hp}
              actualHp={status.actualHp}
              level={status.level}
              name={status.name}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default StatusRow;
