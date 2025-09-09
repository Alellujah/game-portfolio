import type { Meta, StoryObj } from "@storybook/react-vite";
import ScreenFrame from "./ScreenFrame";
import BattleScene from "./BattleScene";
import MONS from "../engine/mons";

const meta: Meta<typeof ScreenFrame> = {
  title: "Features/ScreenFrame",
  component: ScreenFrame,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ScreenFrame>;

const enemyMons = [
  MONS["ghostcruiter"],
  MONS["leetcodebat"],
  MONS["testzilla"],
];
const playerMons = [
  MONS["remotemon"],
  MONS["paycheckuchu"],
  MONS["levelupzord"],
];

export const Default: Story = {
  args: {
    scanlines: true,
    label: "FabioBoy",
    children: (
      <BattleScene
        playerSpriteUrl={"/players/recruiter-back.png"}
        enemySpriteUrl={"/players/developer-front.png"}
        playerMons={playerMons}
        enemyMons={enemyMons}
      />
    ),
  },
};
