import { useState, useEffect, useRef } from "react";
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

  const [muted, setMuted] = useState(false);

  const { selectedPlayer, setSelectedPlayer } = usePlayer();

  // When entering the final scene, briefly fade to black for a smoother cut
  useEffect(() => {
    if (scene !== "ending") return;
    const t = setTimeout(() => setScene("end"), 360);
    return () => clearTimeout(t);
  }, [scene]);

  useEffect(() => {
    if (palletTownAudioRef.current) palletTownAudioRef.current.muted = muted;
    if (tainerBattleAudioRef.current)
      tainerBattleAudioRef.current.muted = muted;
  }, [muted]);

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

  const palletTownAudioRef = useRef<HTMLAudioElement>(null);
  const tainerBattleAudioRef = useRef<HTMLAudioElement>(null);

  return (
    <div
      style={{ height: SCREEN_H, width: SCREEN_W, border: "1px solid black" }}
      className={"bg-stone-200 relative overflow-hidden"}
    >
      <button
        onClick={() => setMuted((m) => !m)}
        className="absolute top-2 right-2 z-50 bg-white/80 px-3 py-1 rounded text-sm shadow"
      >
        {muted ? "Unmute" : "Mute"}
      </button>
      {scene === "splash" && (
        <SplashScreen
          onStart={() => {
            palletTownAudioRef.current = new Audio("midi/pallet-town.mp3");
            palletTownAudioRef.current.loop = true;
            palletTownAudioRef.current.muted = muted;
            palletTownAudioRef.current.play();
            setScene("playerSelection");
          }}
        />
      )}
      {scene === "playerSelection" && (
        <PlayerChoice
          onSelect={(char) => {
            palletTownAudioRef.current?.pause();

            tainerBattleAudioRef.current = new Audio("midi/trainer-battle.mp3");
            tainerBattleAudioRef.current.loop = true;
            tainerBattleAudioRef.current.muted = muted;
            tainerBattleAudioRef.current.play();

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
