import type { Meta, StoryObj } from "@storybook/react-vite";
import Menu from "./Battlefield";
import MONS from "../engine/mons";

const meta: Meta<typeof Menu> = {
  title: "Features/Battlefield",
  component: Menu,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Menu>;

export const Default: Story = {
  args: {
    playerSpriteUrl: "public/players/back-recruiter-green.png",
    enemySpriteUrl: "public/players/nerd_it_guy-green.png",
    playerMon: { ...MONS["remotemon"], maxHp: 100, level: 50 },
    enemyMon: { ...MONS["paycheckuchu"], maxHp: 120, level: 45 },
    playerMons: [MONS["remotemon"]],
    enemyMons: [MONS["remotemon"]],
  },
};
