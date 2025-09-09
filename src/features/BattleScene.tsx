import { useState, useEffect } from "react";
import BattleIntro from "./BattleIntro";
import Battlefield from "./Battlefield";
import { type Mon } from "../engine/mons";
import FinalScene from "./FinalScene";
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
  const [scene, setScene] = useState<"intro" | "field" | "ending" | "end">("intro");
  const [result, setResult] = useState<"won" | "lost" | null>(null);

  // When entering the final scene, briefly fade to black for a smoother cut
  useEffect(() => {
    if (scene !== "ending") return;
    const t = setTimeout(() => setScene("end"), 360);
    return () => clearTimeout(t);
  }, [scene]);

  return (
    <div
      style={{ height: SCREEN_H, width: SCREEN_W, border: "1px solid black" }}
      className={"bg-stone-200 relative overflow-hidden"}
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
            onEnd={(r) => {
              setResult(r);
              setScene("ending");
            }}
          />
        </div>
      )}

      {scene === "ending" && (
        <div className="absolute inset-0 bg-black fade-to-black" />
      )}

      {scene === "end" && result && (
        <FinalScene
          playerSpriteUrl={playerSpriteUrl}
          enemySpriteUrl={enemySpriteUrl}
          result={result}
        />
      )}
    </div>
  );
}
