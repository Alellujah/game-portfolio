import { useState } from "react";
import BattleIntro from "./BattleIntro";
import Battlefield from "./Battlefield";
import { type Mon } from "../engine/mons";

interface Props {
  playerSpriteUrl: string;
  enemySpriteUrl: string;
  playerMons: Mon[];
  enemyMons: Mon[];
}

export default function BattleScene({
  enemyMons,
  enemySpriteUrl,
  playerMons,
  playerSpriteUrl,
}: Props) {
  const [scene, setScene] = useState<"intro" | "field" | "end">("intro");

  return (
    <>
      {scene === "intro" && (
        <BattleIntro
          playerSpriteUrl={playerSpriteUrl}
          enemySpriteUrl={enemySpriteUrl}
          onFinish={() => setScene("field")}
          enemyMons={enemyMons}
          playerMons={playerMons}
        />
      )}

      {scene === "field" && (
        <Battlefield
          playerMon={playerMons[0]}
          enemyMon={enemyMons[0]}
          playerParty={playerMons}
        />
      )}

      {scene === "end" && <></>}
    </>
  );
}
