export type Mon = {
  id: number;
  name: string;
  type: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  level?: number;
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
    moves: [
      { name: "Code Strike", type: "NORMAL", pp: 15, maxPP: 15, power: 40 },
      { name: "Debug Punch", type: "FIGHTING", pp: 10, maxPP: 10, power: 50 },
      { name: "Refactor Blast", type: "PSYCHIC", pp: 5, maxPP: 5, power: 70 },
      { name: "Deploy Shield", type: "STEEL", pp: 20, maxPP: 20, power: 0 },
    ],
    spriteFrontUrl: "public/mons/remotemon-front.png",
    spriteBackUrl: "public/mons/remotemon-back.png",
  },
  paycheckuchu: {
    id: 2,
    name: "PaycheckUchu",
    type: "ELECTRIC",
    hp: 90,
    attack: 60,
    defense: 40,
    speed: 80,
    moves: [
      { name: "Invoice Shock", type: "ELECTRIC", pp: 15, maxPP: 15, power: 40 },
      { name: "Budget Bolt", type: "ELECTRIC", pp: 10, maxPP: 10, power: 50 },
      { name: "Tax Thunder", type: "ELECTRIC", pp: 5, maxPP: 5, power: 70 },
      { name: "Audit Guard", type: "NORMAL", pp: 20, maxPP: 20, power: 0 },
    ],
    spriteFrontUrl: "public/mons/paycheckuchu-front.png",
    spriteBackUrl: "public/mons/paycheckuchu-back.png",
  },
  levelupzord: {
    id: 3,
    name: "LevelUpZord",
    type: "DRAGON",
    hp: 110,
    attack: 70,
    defense: 60,
    speed: 50,
    moves: [
      { name: "XP Slash", type: "DRAGON", pp: 15, maxPP: 15, power: 40 },
      { name: "Skill Surge", type: "DRAGON", pp: 10, maxPP: 10, power: 50 },
      { name: "Power-Up Roar", type: "NORMAL", pp: 5, maxPP: 5, power: 70 },
      { name: "Evolve Shield", type: "STEEL", pp: 20, maxPP: 20, power: 0 },
    ],
    spriteFrontUrl: "public/mons/levelupzord-front.png",
    spriteBackUrl: "public/mons/levelupzord-back.png",
  },
  testzilla: {
    id: 4,
    name: "TestZilla",
    type: "BUG",
    hp: 95,
    attack: 55,
    defense: 45,
    speed: 65,
    moves: [
      { name: "Bug Bite", type: "BUG", pp: 15, maxPP: 15, power: 40 },
      { name: "Test Swarm", type: "BUG", pp: 10, maxPP: 10, power: 50 },
      { name: "Debug Roar", type: "NORMAL", pp: 5, maxPP: 5, power: 70 },
      { name: "Code Shield", type: "STEEL", pp: 20, maxPP: 20, power: 0 },
    ],
    spriteFrontUrl: "public/mons/testzilla-front.png",
    spriteBackUrl: "public/mons/testzilla-back.png",
  },
  leetcodebat: {
    id: 5,
    name: "LeetCodeBat",
    type: "FLYING",
    hp: 85,
    attack: 65,
    defense: 35,
    speed: 90,
    moves: [
      { name: "Code Wing", type: "FLYING", pp: 15, maxPP: 15, power: 40 },
      { name: "Algorithm Dive", type: "FLYING", pp: 10, maxPP: 10, power: 50 },
      { name: "Debug Scream", type: "NORMAL", pp: 5, maxPP: 5, power: 70 },
      { name: "Syntax Shield", type: "STEEL", pp: 20, maxPP: 20, power: 0 },
    ],
    spriteFrontUrl: "public/mons/leetcodebat-front.png",
    spriteBackUrl: "public/mons/leetcodebat-back.png",
  },
  ghostcruiter: {
    id: 6,
    name: "Ghostcruiter",
    type: "GHOST",
    hp: 80,
    attack: 50,
    defense: 40,
    speed: 70,
    moves: [
      { name: "Phantom Hire", type: "GHOST", pp: 15, maxPP: 15, power: 40 },
      {
        name: "Spectral Interview",
        type: "GHOST",
        pp: 10,
        maxPP: 10,
        power: 50,
      },
      { name: "Ethereal Call", type: "GHOST", pp: 5, maxPP: 5, power: 70 },
      { name: "Haunt Shield", type: "GHOST", pp: 20, maxPP: 20, power: 0 },
    ],
    spriteFrontUrl: "public/mons/ghostcruiter-front.png",
    spriteBackUrl: "public/mons/ghostcruiter-back.png",
  },
};

export default MONS;
