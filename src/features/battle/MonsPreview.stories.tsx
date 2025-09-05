import type { Meta, StoryObj } from "@storybook/react-vite";
import MonsPreview from "./MonsPreview";
import MONS from "../../engine/mons";

const meta: Meta<typeof MonsPreview> = {
  title: "Features/MonsPreview",
  component: MonsPreview,
  tags: ["autodocs"],
  argTypes: {
    totalSlots: { control: { type: "number", min: 1, max: 6, step: 1 } },
    size: { control: { type: "number", min: 10, max: 32, step: 1 } },
  },
};

export default meta;

type Story = StoryObj<typeof MonsPreview>;

export const Default: Story = {
  args: {
    mons: [MONS["remotemon"], MONS["paycheckuchu"], MONS["levelupzord"]],
    totalSlots: 6,
    size: 16,
  },
};

export const SomeEmpty: Story = {
  args: {
    mons: [MONS["remotemon"], MONS["paycheckuchu"]],
    totalSlots: 6,
    size: 16,
  },
};

export const WithFainted: Story = {
  args: {
    mons: [
      { ...MONS["remotemon"], hp: 0 },
      MONS["paycheckuchu"],
      { ...MONS["testzilla"], hp: 0 },
      MONS["leetcodebat"],
    ],
    totalSlots: 6,
    size: 16,
  },
};
