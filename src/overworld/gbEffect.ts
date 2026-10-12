import { Effect } from "postprocessing";
import { Uniform, Vector3 } from "three";

// The same greys the battle scene uses (outline, dark, mid, light, stone-200 background)
export const GB_PALETTE = ["#1c1b1b", "#585654", "#908e8c", "#c7c5c3", "#e7e5e4"];

const fragmentShader = /* glsl */ `
uniform vec3 palette[5];
uniform float granularity;
uniform float dither;
uniform float contrast;
uniform float brightness;

float bayer4(vec2 p) {
  int i = int(mod(p.x, 4.0)) + int(mod(p.y, 4.0)) * 4;
  float m[16] = float[16](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);
  return m[i] / 16.0 - 0.5;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // Work in display (sRGB-ish) space so the shade steps look even
  vec3 c = pow(max(inputColor.rgb, 0.0), vec3(1.0 / 2.2));
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  l = clamp((l - 0.5) * contrast + 0.5 + brightness, 0.0, 1.0);
  // Ordered dithering on the Game Boy pixel grid
  l += bayer4(floor(gl_FragCoord.xy / granularity)) * dither / 5.0;
  int idx = int(clamp(floor(l * 5.0), 0.0, 4.0));
  outputColor = vec4(pow(palette[idx], vec3(2.2)), inputColor.a);
}
`;

function hexToVec3(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** Quantizes the image to the 5-shade Game Boy-style grey palette. */
export class GBPaletteEffect extends Effect {
  constructor({
    granularity = 3,
    dither = 0,
    contrast = 1.1,
    brightness = 0.16,
  } = {}) {
    super("GBPaletteEffect", fragmentShader, {
      uniforms: new Map<string, Uniform>([
        ["palette", new Uniform(GB_PALETTE.map(hexToVec3))],
        ["granularity", new Uniform(granularity)],
        ["dither", new Uniform(dither)],
        ["contrast", new Uniform(contrast)],
        ["brightness", new Uniform(brightness)],
      ]),
    });
  }
}
