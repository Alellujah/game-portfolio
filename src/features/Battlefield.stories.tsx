import type { Meta, StoryObj } from "@storybook/react-vite";
import MONS from "../engine/mons";
import Battlefield from "./Battlefield";
import "../index.css";

const meta: Meta<typeof Battlefield> = {
  title: "Features/Battlefield",
  component: Battlefield,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Battlefield>;

export const Default: Story = {
  args: {
    playerMon: { ...MONS["paycheckuchu"], level: 50 },
    enemyMon: { ...MONS["paycheckuchu"], level: 45 },
    playerParty: [
      { ...MONS["paycheckuchu"], level: 50 },
      { ...MONS["remotemon"], level: 35 },
      { ...MONS["levelupzord"], level: 33 },
    ],
  },
};

export const WithMonsPreviewBasic: Story = {
  args: {
    playerMon: { ...MONS["remotemon"], level: 42 },
    enemyMon: { ...MONS["testzilla"], level: 39 },
    playerParty: [
      { ...MONS["remotemon"], level: 42 },
      { ...MONS["ghostcruiter"], level: 38 },
    ],
  },
};

export const WithFaintedAndEmpty: Story = {
  args: {
    playerMon: { ...MONS["levelupzord"], level: 50 },
    enemyMon: { ...MONS["ghostcruiter"], level: 48 },
    playerParty: [
      { ...MONS["levelupzord"], level: 50 },
      { ...MONS["remotemon"], level: 45 },
    ],
  },
};

export const ChangeAnimation: Story = {
  args: {
    playerMon: { ...MONS["remotemon"], level: 42 },
    enemyMon: { ...MONS["testzilla"], level: 39 },
    playerParty: [
      { ...MONS["remotemon"], level: 42 },
      { ...MONS["levelupzord"], level: 37 },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Open the battle menu, choose CHG, then pick the other mon to see the retreat/enter animation with dust.",
      },
    },
  },
};

export const ForcedChangeOnFaint: Story = {
  args: {
    playerMon: { ...MONS["remotemon"], level: 5, hp: 12, defense: 5 },
    enemyMon: {
      ...MONS["testzilla"],
      level: 80,
      attack: 200,
      moves: MONS["testzilla"].moves.map((m) => ({ ...m, power: 80 })),
    },
    playerParty: [
      { ...MONS["remotemon"], level: 5, hp: 12, defense: 5 },
      { ...MONS["levelupzord"], level: 30, hp: 120 },
      { ...MONS["leetcodebat"], level: 25, hp: 90 },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pick FIGHT and let the enemy hit you. When your mon faints, a forced Change menu opens; choose another to continue.",
      },
    },
  },
};
