import "./App.css";
import MONS, { type Mon } from "./engine/mons";
import BattleScene from "./features/BattleScene";

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
    <BattleScene
      playerSpriteUrl={playerSpriteUrl}
      enemySpriteUrl={enemySpriteUrl}
      playerMons={playerMons}
      enemyMons={enemyMons}
    />
  );
}

export default App;
