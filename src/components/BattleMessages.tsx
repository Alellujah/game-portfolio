import { useEffect, useState } from "react";
import Container from "./Container";

type Props = {
  message: string;
  speed?: number; // ms per character
  className?: string;
};

function BattleMessages({ message, speed = 30, className = "" }: Props) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!message) {
      setDisplayed("");
      return;
    }

    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(message.slice(0, i));
      if (i >= message.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [message, speed]);

  return (
    <Container fixedWidth className={className}>
      <p className={`text-black text-xl leading-snug`}>{displayed}</p>
    </Container>
  );
}

export default BattleMessages;
