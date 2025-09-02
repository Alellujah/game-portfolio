import type { Meta, StoryObj } from "@storybook/react-vite";
import BattleMenu from "./BattleMenu";

const meta: Meta<typeof BattleMenu> = {
  title: "Components/BattleMenu",
  component: BattleMenu,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof BattleMenu>;

export const Default: Story = {
  args: {
    onSelect: (action: string) => alert(`Selected action: ${action}`),
  },
};
