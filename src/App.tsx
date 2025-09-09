import "./App.css";
import MONS, { type Mon } from "./engine/mons";
import BattleScene from "./features/BattleScene";
import ScreenFrame from "./features/ScreenFrame";

const enemyMons: Mon[] = [
  { ...MONS["ghostcruiter"], level: 69 },
  { ...MONS["leetcodebat"], level: 50 },
  { ...MONS["testzilla"], level: 50 },
];
const playerMons: Mon[] = [
  { ...MONS["remotemon"], level: 50 },
  { ...MONS["paycheckuchu"], level: 50 },
  { ...MONS["levelupzord"], level: 50 },
];

const playerSpriteUrl = "/players/recruiter-back.png";
const enemySpriteUrl = "/players/developer-front.png";

function App() {
  return (
    <>
      <ScreenFrame scanlines={true} label="FabioBoy">
        <BattleScene
          playerSpriteUrl={playerSpriteUrl}
          enemySpriteUrl={enemySpriteUrl}
          playerMons={playerMons}
          enemyMons={enemyMons}
        />
      </ScreenFrame>
    </>
  );
}

export default App;
