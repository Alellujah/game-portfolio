import type { Meta, StoryObj } from "@storybook/react-vite";
import Sprite from "./Sprite";
import MONS from "../engine/mons";

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

export const AllMons: Story = {
  render: () => {
    const mons = Object.values(MONS);
    return (
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mons.map((m) => (
            <div
              key={m.id}
              className="bg-white/50 rounded p-2 flex flex-col items-center"
            >
              <div className="text-xs mb-1">{m.name}</div>
              <div className="flex items-center gap-2">
                <Sprite spriteUrl={m.spriteFrontUrl} size={96} />
                <Sprite spriteUrl={m.spriteBackUrl} size={96} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
