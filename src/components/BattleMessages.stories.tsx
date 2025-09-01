import type { Meta, StoryObj } from "@storybook/react-vite";
import BattleMessages from "./BattleMessages";

const meta: Meta<typeof BattleMessages> = {
  title: "Components/BattleMessages",
  component: BattleMessages,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof BattleMessages>;

export const Default: Story = {
  args: {
    message: "A wild DEVELOPER appeared!",
    speed: 30,
  },
};
