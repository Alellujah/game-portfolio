import type { Meta, StoryObj, Decorator } from "@storybook/react-vite"; // works with react-vite too
import PlayerChoice from "./PlayerChoice";
import { PlayerProvider } from "../context/PlayerContext"; // from src/features -> src/context

const withProvider: Decorator = (Story) => (
  <PlayerProvider>
    <div style={{ width: 720, maxWidth: "90vw", padding: 16 }}>
      <Story />
    </div>
  </PlayerProvider>
);

const meta: Meta<typeof PlayerChoice> = {
  title: "Features/PlayerChoice",
  component: PlayerChoice,
  tags: ["autodocs"],
  decorators: [withProvider],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Use left/right arrow keys to highlight a character and press Enter to confirm. Click a card to select as well.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof PlayerChoice>;

export const Default: Story = {
  args: {
    onSelect: () => console.log("select"),
  },
};
