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
    playerMon: { ...MONS["remotemon"], level: 50 },
    enemyMon: { ...MONS["paycheckuchu"], level: 45 },
    playerMons: [MONS["remotemon"]],
    enemyMons: [MONS["remotemon"]],
  },
};
