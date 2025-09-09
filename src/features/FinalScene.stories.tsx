import type { Meta, StoryObj } from "@storybook/react-vite";
import FinalScene from "./FinalScene";

const meta: Meta<typeof FinalScene> = {
  title: "Features/FinalScene",
  component: FinalScene,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof FinalScene>;

export const Won: Story = {
  args: {
    playerSpriteUrl: "/players/recruiter-back.png",
    enemySpriteUrl: "/players/developer-front.png",
    result: "won",
    messages: ["Enemy fainted!", "You won the battle!"],
    contactUrl: "mailto:hello@example.com",
  },
};

export const Lost: Story = {
  args: {
    playerSpriteUrl: "/players/recruiter-back.png",
    enemySpriteUrl: "/players/developer-front.png",
    result: "lost",
    messages: ["You fainted...", "Better luck next time!"],
    contactUrl: "mailto:hello@example.com",
  },
};
