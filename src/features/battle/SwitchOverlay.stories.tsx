import type { Meta, StoryObj } from "@storybook/react-vite";
import SwitchOverlay from "./SwitchOverlay";
import type { SwitchMon } from "../../components/Menu/SwitchMenu";

const meta: Meta<typeof SwitchOverlay> = {
  title: "Features/SwitchOverlay",
  component: SwitchOverlay,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof SwitchOverlay>;

const mons: SwitchMon[] = [
  { name: "Remotemon", hp: 40, maxHp: 40, index: 0 },
  { name: "Paycheckuchu", hp: 10, maxHp: 50, index: 1 },
];

export const Default: Story = {
  args: {
    mons,
    onSelect: (mon) => alert(mon ? `Switch to ${mon.name}` : "Cancel"),
    onCancel: () => alert("Cancel"),
  },
};
