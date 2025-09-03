import { useState } from "react";
import BattleMessages from "../components/BattleMessages";
import BattleMenu from "../components/Menu/BattleMenu";
import Sprite from "../components/Sprite";
import StatusBar from "../components/StatusBar";
import FightMenu from "../components/Menu/FightMenu";
import type { Mon } from "../engine/mons";

interface ActiveMon extends Mon {
  maxHp: number;
  level: number;
}

interface Props {
  playerSpriteUrl?: string;
  enemySpriteUrl?: string;
  playerMon: ActiveMon;
  enemyMon: ActiveMon;
  playerMons: Mon[];
  enemyMons: Mon[];
}

export default function Battlefield({
  enemyMon,
  enemyMons,
  playerMon,
  playerMons,
  playerSpriteUrl,
  enemySpriteUrl,
}: Props) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const messages = (action: string) => {
    switch (action) {
      case "fight":
        return "Choose a move.";
      case "item":
        return "You have no items.";
      case "chg":
        return "No one to change, you're alone mate.";
      case "run":
        return "Can't ghost this time!";
      default:
        return "What will you do?";
    }
  };
  return (
    <div className="bg-stone-200 p-4 max-w-4xl mx-auto">
      <div className="grid grid-cols-3 gap-4 items-stretch mb-4">
        <div className="col-span-1 flex items-start">
          <StatusBar
            hp={enemyMon.maxHp}
            actualHp={enemyMon.hp}
            level={enemyMon.level}
            name={enemyMon.name}
          />
        </div>
        <div className="col-span-2 flex justify-center">
          <Sprite spriteUrl={enemyMon.spriteFrontUrl} size={132} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 items-stretch">
        <div className="col-span-2 justify-center flex">
          <Sprite spriteUrl={playerMon.spriteBackUrl} size={132} />
        </div>
        <div className="col-span-1 flex items-end">
          <StatusBar
            hp={playerMon.maxHp}
            actualHp={playerMon.hp}
            level={playerMon.level}
            name={playerMon.name}
          />
        </div>
      </div>
      <div className="relative">
        <div className="grid grid-cols-3 gap-4 items-stretch">
          <div className="col-span-2">
            <BattleMessages
              message={messages(selectedAction ?? "")}
              className="h-full"
            />
          </div>
          <div className="col-span-1">
            <BattleMenu onSelect={(action) => setSelectedAction(action)} />
          </div>
        </div>

        {selectedAction === "fight" && (
          <>
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-black/40 z-20"
              onClick={() => setSelectedAction(null)}
            />
            {/* overlayed fight menu */}
            <div className="absolute inset-0 z-30 grid place-items-center">
              <div className="w-full">
                <FightMenu
                  skills={playerMon?.moves || []}
                  onSelect={(skill) => {
                    // handle the selected skill here
                    // for now, just close the overlay
                    setSelectedAction(null);
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
