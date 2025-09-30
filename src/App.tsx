import "./App.css";
import MONS, { type Mon } from "./engine/mons";
import BattleScene from "./features/BattleScene";
import ScreenFrame from "./features/ScreenFrame";
import { PlayerProvider } from "./context/PlayerContext";

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

const playerSpriteBackUrl = "/players/recruiter-back.png";
const playerSpriteFrontUrl = "/players/recruiter-front.png";
const enemySpriteFrontUrl = "/players/developer-front.png";
const enemySpriteBackUrl = "/players/developer-back.png";

function App() {
  return (
    <>
      <PlayerProvider>
        <ScreenFrame scanlines={true} label="FBoy">
          <BattleScene
            enemySpriteBackUrl={enemySpriteBackUrl}
            enemySpriteFrontUrl={enemySpriteFrontUrl}
            playerBackSpriteUrl={playerSpriteBackUrl}
            playerFrontSpriteUrl={playerSpriteFrontUrl}
            playerMons={playerMons}
            enemyMons={enemyMons}
          />
        </ScreenFrame>
      </PlayerProvider>
    </>
  );
}

export default App;
