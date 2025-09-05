import type { Meta, StoryObj } from "@storybook/react-vite";
import MONS from "../engine/mons";
import Battlefield from "./Battlefield";

const meta: Meta<typeof Battlefield> = {
  title: "Features/Battlefield",
  component: Battlefield,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Battlefield>;

export const Default: Story = {
  args: {
    playerMon: { ...MONS["paycheckuchu"], level: 50 },
    enemyMon: { ...MONS["paycheckuchu"], level: 45 },
    playerParty: [
      { ...MONS["paycheckuchu"], level: 50 },
      { ...MONS["remotemon"], level: 35 },
      { ...MONS["levelupzord"], level: 33 },
    ],
  },
};

export const WithMonsPreviewBasic: Story = {
  args: {
    playerMon: { ...MONS["remotemon"], level: 42 },
    enemyMon: { ...MONS["testzilla"], level: 39 },
    playerParty: [
      { ...MONS["remotemon"], level: 42 },
      { ...MONS["ghostcruiter"], level: 38 },
    ],
  },
};

export const WithFaintedAndEmpty: Story = {
  args: {
    playerMon: { ...MONS["levelupzord"], level: 50 },
    enemyMon: { ...MONS["ghostcruiter"], level: 48 },
    playerParty: [
      { ...MONS["levelupzord"], level: 50 },
      { ...MONS["remotemon"], level: 45 },
    ],
  },
};
