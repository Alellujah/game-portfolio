import type { Meta, StoryObj } from "@storybook/react-vite";
import BattleIntro from "./BattleIntro";
import MONS from "../engine/mons";

const meta: Meta<typeof BattleIntro> = {
  title: "Features/BattleIntro",
  component: BattleIntro,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof BattleIntro>;

export const Default: Story = {
  args: {
    playerSpriteUrl: "public/players/back-recruiter-green.png",
    enemySpriteUrl: "public/players/nerd_it_guy-green.png",
    playerMons: [MONS["remotemon"], MONS["remotemon"], MONS["remotemon"]],
    enemyMons: [MONS["remotemon"], MONS["remotemon"], MONS["remotemon"]],
  },
};
