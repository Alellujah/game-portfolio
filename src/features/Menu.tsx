import { useState } from "react";
import BattleMessages from "../components/BattleMessages";
import BattleMenu from "../components/Menu/BattleMenu";
import Sprite from "../components/Sprite";
import StatusBar from "../components/StatusBar";
import FightMenu from "../components/Menu/FightMenu";

export default function Menu() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const skills = [
    { name: "REACT STRIKE", type: "NORMAL", pp: 15, maxPP: 15, power: 40 },
    { name: "NEXT BEAM", type: "NORMAL", pp: 10, maxPP: 10, power: 55 },
    { name: "UX POLISH", type: "NORMAL", pp: 20, maxPP: 20, power: 25 },
    { name: "DOCKER SLAM", type: "NORMAL", pp: 10, maxPP: 10, power: 50 },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-4 items-stretch">
        <div className="col-span-2">
          <Sprite spriteUrl="public/back-recruiter-no-gb.png" />
        </div>
        <div className="col-span-1 flex items-end">
          <StatusBar hp={100} actualHp={75} level={5} name="Hero" />
        </div>
      </div>
      <div className="relative">
        <div className="grid grid-cols-3 gap-4 items-stretch">
          <div className="col-span-2">
            <BattleMessages message="What will you do?" className="h-full" />
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
                  skills={skills}
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
    </>
  );
}
