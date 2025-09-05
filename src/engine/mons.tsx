export type Mon = {
  id: number;
  name: string;
  type: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  level?: number;
  bio?: string;
  moves: {
    name: string;
    type: string;
    pp: number;
    maxPP: number;
    power: number;
  }[];
  spriteFrontUrl: string;
  spriteBackUrl: string;
};

const MONS: Record<string, Mon> = {
  remotemon: {
    id: 1,
    name: "RemoteMon",
    type: "NORMAL",
    hp: 100,
    attack: 50,
    defense: 40,
    speed: 60,
    bio: "Thrives in pajamas and merges at 4 AM. Uses VPN as a cape.",
    moves: [
      { name: "No RTO, Thanks", type: "NORMAL", pp: 15, maxPP: 15, power: 40 },
      { name: "Flexible Hours", type: "FIGHTING", pp: 10, maxPP: 10, power: 50 },
      { name: "Bye‑Bye Micromanagement", type: "PSYCHIC", pp: 5, maxPP: 5, power: 70 },
      { name: "Work–Life Balance", type: "STEEL", pp: 20, maxPP: 20, power: 0 },
    ],
    spriteFrontUrl: "public/mons/remotemon-gemini-front.png",
    spriteBackUrl: "public/mons/remotemon-gemini-back.png",
  },
  paycheckuchu: {
    id: 2,
    name: "PaycheckUchu",
    type: "ELECTRIC",
    hp: 90,
    attack: 60,
    defense: 40,
    speed: 80,
    bio: "Sparks fly when salaries rise. Negotiates with voltages, not words.",
    moves: [
      { name: "Salary Shock", type: "ELECTRIC", pp: 15, maxPP: 15, power: 45 },
      { name: "Negotiation Thunder", type: "ELECTRIC", pp: 10, maxPP: 10, power: 55 },
      { name: "Bonus Bolt", type: "ELECTRIC", pp: 5, maxPP: 5, power: 70 },
      { name: "Payday Parade", type: "NORMAL", pp: 20, maxPP: 20, power: 0 },
    ],
    spriteFrontUrl: "public/mons/paycheckuchu-gemini-front.png",
    spriteBackUrl: "public/mons/paycheckuchu-gemini-back.png",
  },
  levelupzord: {
    id: 3,
    name: "LevelUpZord",
    type: "DRAGON",
    hp: 110,
    attack: 70,
    defense: 60,
    speed: 50,
    bio: "Evolves after reading one more blog post. Breathes mentorship.",
    moves: [
      { name: "Promotion Punch", type: "FIGHTING", pp: 15, maxPP: 15, power: 50 },
      { name: "Skill Surge", type: "DRAGON", pp: 10, maxPP: 10, power: 55 },
      { name: "Refactor Roar", type: "NORMAL", pp: 5, maxPP: 5, power: 70 },
      { name: "Mentor Shield", type: "STEEL", pp: 20, maxPP: 20, power: 0 },
    ],
    spriteFrontUrl: "public/mons/levelupzord-gemini-front.png",
    spriteBackUrl: "public/mons/levelupzord-gemini-back.png",
  },
  testzilla: {
    id: 4,
    name: "TestZilla",
    type: "BUG",
    hp: 95,
    attack: 55,
    defense: 45,
    speed: 65,
    bio: "Crushes builds and spirits. Fails only when you demo.",
    moves: [
      { name: "Unit Chomp", type: "BUG", pp: 15, maxPP: 15, power: 45 },
      { name: "Flaky Swipe", type: "BUG", pp: 10, maxPP: 10, power: 40 },
      { name: "Regression Rampage", type: "NORMAL", pp: 5, maxPP: 5, power: 75 },
      { name: "Merge Conflict", type: "STEEL", pp: 20, maxPP: 20, power: 0 },
    ],
    spriteFrontUrl: "public/mons/testzilla-gemini-front.png",
    spriteBackUrl: "public/mons/testzilla-gemini-back.png",
  },
  leetcodebat: {
    id: 5,
    name: "LeetCodeBat",
    type: "FLYING",
    hp: 85,
    attack: 65,
    defense: 35,
    speed: 90,
    bio: "Screeches in O(log n). Spotted only at 3 AM coding sessions.",
    moves: [
      { name: "Two‑Sum Wing", type: "FLYING", pp: 15, maxPP: 15, power: 45 },
      { name: "Binary Search Swoop", type: "FLYING", pp: 10, maxPP: 10, power: 55 },
      { name: "DP Dive", type: "PSYCHIC", pp: 5, maxPP: 5, power: 70 },
      { name: "Greedy Gust", type: "NORMAL", pp: 20, maxPP: 20, power: 0 },
    ],
    spriteFrontUrl: "public/mons/leetcodebat-gemini-front.png",
    spriteBackUrl: "public/mons/leetcodebat-gemini-back.png",
  },
  ghostcruiter: {
    id: 6,
    name: "Ghostcruiter",
    type: "GHOST",
    hp: 80,
    attack: 50,
    defense: 40,
    speed: 70,
    bio: "Promises feedback. Disappears for weeks. Reappears with a new role.",
    moves: [
      { name: "Seen‑Zone", type: "GHOST", pp: 15, maxPP: 15, power: 40 },
      { name: "No‑Feedback Mist", type: "GHOST", pp: 10, maxPP: 10, power: 55 },
      { name: "Vanishing Offer", type: "GHOST", pp: 5, maxPP: 5, power: 75 },
      { name: "Cold Outreach", type: "GHOST", pp: 20, maxPP: 20, power: 0 },
    ],
    spriteFrontUrl: "public/mons/ghostcruiter-gemini-front.png",
    spriteBackUrl: "public/mons/ghostcruiter-gemini-back.png",
  },
};

export default MONS;
