import type { Meta, StoryObj } from "@storybook/react-vite";
import SwitchMenu, { type SwitchMon } from "./SwitchMenu";

const meta: Meta<typeof SwitchMenu> = {
  title: "Components/SwitchMenu",
  component: SwitchMenu,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof SwitchMenu>;

const sampleMons: SwitchMon[] = [
  { name: "Remotemon", hp: 40, maxHp: 40, index: 0 },
  { name: "Paycheckuchu", hp: 10, maxHp: 50, index: 1 },
  { name: "Bugio", hp: 0, maxHp: 30, index: 2 },
];

export const Default: Story = {
  args: {
    mons: sampleMons,
    onSelect: (mon) => alert(mon ? `Switch to ${mon.name}` : "Cancel"),
  },
};
