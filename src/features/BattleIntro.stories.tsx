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
    playerSpriteUrl: "public/players/developer-back.png",
    enemySpriteUrl: "public/players/recruiter-front.png",
    playerMons: [MONS["remotemon"], MONS["remotemon"], MONS["remotemon"]],
    enemyMons: [MONS["remotemon"], MONS["remotemon"], MONS["remotemon"]],
  },
};

export const WithEmptySlots: Story = {
  args: {
    playerSpriteUrl: "public/players/back-recruiter-green.png",
    enemySpriteUrl: "public/players/nerd_it_guy-green.png",
    playerMons: [MONS["remotemon"], MONS["paycheckuchu"]],
    enemyMons: [MONS["testzilla"]],
  },
};

export const WithFaintedAndEmpty: Story = {
  args: {
    playerSpriteUrl: "public/players/back-recruiter-green.png",
    enemySpriteUrl: "public/players/nerd_it_guy-green.png",
    playerMons: [
      { ...MONS["remotemon"], hp: 0 },
      MONS["levelupzord"],
      { ...MONS["leetcodebat"], hp: 0 },
    ],
    enemyMons: [MONS["ghostcruiter"], { ...MONS["testzilla"], hp: 0 }],
  },
};
