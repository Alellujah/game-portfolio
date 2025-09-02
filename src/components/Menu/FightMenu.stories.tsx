import type { Meta, StoryObj } from "@storybook/react-vite";
import FightMenu from "./FightMenu";

const meta: Meta<typeof FightMenu> = {
  title: "Components/FightMenu",
  component: FightMenu,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof FightMenu>;

export const Default: Story = {
  args: {
    skills: [
      { name: "React Strike", power: 14, pp: 15, maxPP: 15, type: "fire" },
      { name: "Next.js Beam", power: 18, pp: 10, maxPP: 10, type: "water" },
      { name: "UX Polish", power: 8, pp: 20, maxPP: 20, type: "grass" },
      { name: "Docker Slam", power: 12, pp: 15, maxPP: 15, type: "electric" },
    ],
  },
};

export const FewSkills: Story = {
  args: {
    skills: [
      { name: "Quick Fix", power: 6, pp: 30, maxPP: 30, type: "fire" },
      { name: "Refactor", power: 10, pp: 5, maxPP: 5, type: "fire" },
    ],
  },
};

export const LongNames: Story = {
  args: {
    skills: [
      {
        name: "Super Effective Typescript Refactor",
        power: 22,
        pp: 5,
        maxPP: 5,
        type: "fire",
      },
      {
        name: "Micro-Interaction Polish",
        power: 9,
        pp: 15,
        maxPP: 15,
        type: "fire",
      },
      {
        name: "Accessibility Sweep (A11y)",
        power: 11,
        pp: 10,
        maxPP: 10,
        type: "fire",
      },
      {
        name: "Cloud Deploy & Smoke Tests",
        power: 13,
        pp: 8,
        maxPP: 8,
        type: "fire",
      },
    ],
  },
};
