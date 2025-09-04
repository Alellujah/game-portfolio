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

export const Default: Story = {
  args: {
    playerSpriteUrl: "public/players/back-recruiter-green.png",
    enemySpriteUrl: "public/players/nerd_it_guy-green.png",
    playerMons: [MONS["remotemon"], MONS["paycheckuchu"]],
    enemyMons: [MONS["remotemon"], MONS["paycheckuchu"]],
  },
};
