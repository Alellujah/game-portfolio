import type { Meta, StoryObj } from "@storybook/react-vite";
import BattleScene from "./BattleScene";
import MONS from "../engine/mons";

const meta: Meta<typeof BattleScene> = {
  title: "Features/BattleScene",
  component: BattleScene,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof BattleScene>;

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
    playerSpriteUrl: "public/players/recruiter-back.png",
    enemySpriteUrl: "public/players/developer-front.png",
    playerMons: playerMons,
    enemyMons: enemyMons,
  },
};
