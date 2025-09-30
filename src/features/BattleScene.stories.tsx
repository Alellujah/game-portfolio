import type { Meta, StoryObj, Decorator } from "@storybook/react-vite";
import { PlayerProvider } from "../context/PlayerContext";
import BattleScene from "./BattleScene";
import MONS from "../engine/mons";

const withProvider: Decorator = (Story) => (
  <PlayerProvider>
    <Story />
  </PlayerProvider>
);

const meta: Meta<typeof BattleScene> = {
  title: "Features/BattleScene",
  component: BattleScene,
  tags: ["autodocs"],
  decorators: [withProvider],
};

export default meta;

type Story = StoryObj<typeof BattleScene>;

const enemyMons = [
  // { ...MONS["ghostcruiter"], level: 99 },
  // MONS["leetcodebat"],
  MONS["testzilla"],
];
const playerMons = [
  { ...MONS["remotemon"], level: 99 },
  // MONS["paycheckuchu"],
  // MONS["levelupzord"],
];
export const Default: Story = {
  args: {
    playerBackSpriteUrl: "/players/recruiter-back.png",
    playerFrontSpriteUrl: "/players/recruiter-front.png",
    enemySpriteBackUrl: "/players/developer-back.png",
    enemySpriteFrontUrl: "/players/developer-front.png",
    playerMons: playerMons,
    enemyMons: enemyMons,
  },
};
