export const BASE_W = 160;
export const BASE_H = 144;
export const SCALE = 3; // change once to scale the whole game

// Base sprite size designed at 1x. 44 * SCALE = 132px currently.
export const SPRITE_BASE = 44;

export const SCREEN_W = BASE_W * SCALE;
export const SCREEN_H = BASE_H * SCALE;

export const PAD_BASE = 4; // px at 1x
export const pad = (n = 1) => n * PAD_BASE * SCALE; // px
