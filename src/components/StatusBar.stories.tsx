import type { Meta, StoryObj } from "@storybook/react-vite";
import StatusBar from "./StatusBar";

const meta: Meta<typeof StatusBar> = {
  title: "Components/StatusBar",
  component: StatusBar,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof StatusBar>;

export const Default: Story = {
  args: {
    hp: 80,
    name: "Computer Nerd",
    level: 60,
    actualHp: 80,
  },
};

export const LowHealth: Story = {
  args: {
    hp: 80,
    name: "Computer Nerd",
    level: 60,
    actualHp: 10,
  },
};

export const MidStats: Story = {
  args: {
    hp: 80,
    name: "Computer Nerd",
    level: 60,
    actualHp: 40,
  },
};
