import { useEffect, useState } from "react";

type Props = {
  message: string;
  speed?: number; // ms per character
};

function BattleMessages({ message, speed = 30 }: Props) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < message.length) {
        setDisplayed((prev) => prev + message[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [message, speed]);

  return (
    <div className="inline-block border-4 border-black bg-white p-4 w-96">
      <p className="text-black text-lg font-bold font-mono">{displayed}</p>
    </div>
  );
}

export default BattleMessages;
