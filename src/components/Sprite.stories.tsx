import type { Meta, StoryObj } from "@storybook/react-vite";
import Sprite from "./Sprite";

const meta: Meta<typeof Sprite> = {
  title: "Features/Sprite",
  component: Sprite,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Sprite>;

export const Default: Story = {
  args: {
    spriteUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    size: 256,
  },
};
