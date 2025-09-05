import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import AnimatedSwitchSprite from "./AnimatedSwitchSprite";
import "../../index.css";
import MONS from "../../engine/mons";

const meta: Meta<typeof AnimatedSwitchSprite> = {
  title: "Features/AnimatedSwitchSprite",
  component: AnimatedSwitchSprite,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof AnimatedSwitchSprite>;

export const ToggleDemo: Story = {
  render: () => {
    const a = MONS["remotemon"].spriteBackUrl;
    const b = MONS["levelupzord"].spriteBackUrl;
    const c = MONS["ghostcruiter"].spriteFrontUrl;
    const d = MONS["testzilla"].spriteFrontUrl;
    const [left, setLeft] = useState(a);
    const [right, setRight] = useState(c);
    return (
      <div className="p-4 space-y-4">
        <div className="flex justify-between gap-8">
          <div className="w-40 h-40 border-2 border-black grid place-items-center bg-white">
            <AnimatedSwitchSprite side="player" spriteUrl={left} />
          </div>
          <div className="w-40 h-40 border-2 border-black grid place-items-center bg-white">
            <AnimatedSwitchSprite side="enemy" spriteUrl={right} />
          </div>
        </div>
        <div className="flex gap-4">
          <button
            className="border-2 border-black bg-white px-3 py-1 text-black"
            onClick={() => setLeft((v) => (v === a ? b : a))}
          >
            Switch Player Mon
          </button>
          <button
            className="border-2 border-black bg-white px-3 py-1 text-black"
            onClick={() => setRight((v) => (v === c ? d : c))}
          >
            Switch Enemy Mon
          </button>
        </div>
        <p className="text-sm text-black/70">
          Click the buttons to see the retreat/enter animation with dust.
        </p>
      </div>
    );
  },
};

export const FullSizeInContainer: Story = {
  render: () => {
    const back = MONS["remotemon"].spriteBackUrl;
    const front = MONS["remotemon"].spriteFrontUrl;
    const [url, setUrl] = useState(back);
    return (
      <div className="p-4 space-y-4">
        <div className="w-64 h-48 border-2 border-black bg-white grid place-items-center">
          {/* No size prop → fills container (100%) */}
          <AnimatedSwitchSprite side="player" spriteUrl={url} />
        </div>
        <button
          className="border-2 border-black bg-white px-3 py-1 text-black"
          onClick={() => setUrl((v) => (v === back ? front : back))}
        >
          Toggle Sprite (100% fill)
        </button>
      </div>
    );
  },
};
