import Container from "./layout/Container";

type StatusBarProps = {
  hp: number; // 0 to 100
  level: number;
  name: string;
  actualHp: number;
};

function StatusBar({ hp, level, name, actualHp }: StatusBarProps) {
  const hpPercent = Math.max(0, Math.min(100, (actualHp / hp) * 100));
  let barColor = "bg-green-600";
  if (hpPercent <= 25) barColor = "bg-red-600";
  else if (hpPercent <= 50) barColor = "bg-yellow-400";

  return (
    <Container className="w-full p-2 mb-4">
      <div className="text-center mb-1">
        <div className="uppercase tracking-wide text-black text-base font-bold">
          {name}
        </div>
        <div className="text-black text-sm font-bold">:L{level}</div>
      </div>
      <div className="flex items-center mb-1">
        <div className="text-black text-sm font-bold mr-2">HP:</div>
        <div className="flex-1 h-3 bg-white border border-black rounded overflow-hidden relative">
          <div
            className={`absolute left-0 top-0 h-full ${barColor} transition-all duration-300`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>
      <div className="flex items-center mt-2">
        <div className="flex-1 border-t-2 border-black mr-2" />
        <div className="text-black text-lg font-bold tracking-wide">
          {actualHp} / {hp}
        </div>
        <div className="flex-1 border-t-2 border-black ml-2" />
      </div>
    </Container>
  );
}

export default StatusBar;
