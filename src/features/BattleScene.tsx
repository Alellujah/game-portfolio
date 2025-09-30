import { useState, useEffect } from "react";
import BattleIntro from "./BattleIntro";
import Battlefield from "./Battlefield";
import { type Mon } from "../engine/mons";
import FinalScene from "./FinalScene";
import { SCREEN_H, SCREEN_W } from "../config/ui";
import PlayerChoice from "./PlayerChoice";
import { usePlayer } from "../context/PlayerContext";
import SplashScreen from "../components/SplashScreen";

interface Props {
  playerFrontSpriteUrl: string;
  playerBackSpriteUrl: string;
  enemySpriteFrontUrl: string;
  enemySpriteBackUrl: string;
  playerMons: Mon[];
  enemyMons: Mon[];
}

export default function BattleScene({
  enemyMons,
  enemySpriteBackUrl,
  enemySpriteFrontUrl,
  playerMons,
  playerBackSpriteUrl,
  playerFrontSpriteUrl,
}: Props) {
  const [scene, setScene] = useState<
    "splash" | "playerSelection" | "intro" | "field" | "ending" | "end"
  >("splash");
  const [result, setResult] = useState<"won" | "lost" | null>(null);

  const { selectedPlayer, setSelectedPlayer } = usePlayer();

  // When entering the final scene, briefly fade to black for a smoother cut
  useEffect(() => {
    if (scene !== "ending") return;
    const t = setTimeout(() => setScene("end"), 360);
    return () => clearTimeout(t);
  }, [scene]);

  const playerSpriteUrl =
    selectedPlayer?.id === "developer"
      ? enemySpriteBackUrl
      : playerBackSpriteUrl;
  const enemySpriteUrl =
    selectedPlayer?.id === "recruiter"
      ? enemySpriteFrontUrl
      : playerFrontSpriteUrl;

  const selectedPlayerMons =
    selectedPlayer?.id === "developer" ? playerMons : enemyMons;
  const enemyPlayerMons =
    selectedPlayer?.id === "recruiter" ? playerMons : enemyMons;

  return (
    <div
      style={{ height: SCREEN_H, width: SCREEN_W, border: "1px solid black" }}
      className={"bg-stone-200 relative overflow-hidden"}
    >
      {scene === "splash" && (
        <SplashScreen onStart={() => setScene("playerSelection")} />
      )}
      {scene === "playerSelection" && (
        <PlayerChoice
          onSelect={(char) => {
            setSelectedPlayer(char);
            setScene("intro");
          }}
        />
      )}
      {scene === "intro" && (
        <BattleIntro
          playerSpriteUrl={playerSpriteUrl}
          enemySpriteUrl={enemySpriteUrl}
          onFinish={() => setScene("field")}
          enemyMons={enemyPlayerMons}
          playerMons={selectedPlayerMons}
        />
      )}

      {scene === "field" && (
        <div className="scene-fade-in">
          <Battlefield
            playerMon={selectedPlayerMons[0]}
            enemyMon={enemyPlayerMons[0]}
            playerParty={selectedPlayerMons}
            enemyParty={enemyPlayerMons}
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
          contactUrl="https://fabioalbuquerque.com"
        />
      )}
    </div>
  );
}
