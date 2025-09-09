import { useState } from "react";
import BattleIntro from "./BattleIntro";
import Battlefield from "./Battlefield";
import { type Mon } from "../engine/mons";
import { SCREEN_H, SCREEN_W } from "../config/ui";

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
    <div
      style={{ height: SCREEN_H, width: SCREEN_W, border: "1px solid black" }}
      className={"bg-stone-200"}
    >
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
        <div className="scene-fade-in">
          <Battlefield
            playerMon={playerMons[0]}
            enemyMon={enemyMons[0]}
            playerParty={playerMons}
            enemyParty={enemyMons}
          />
        </div>
      )}

      {scene === "end" && <></>}
    </div>
  );
}
