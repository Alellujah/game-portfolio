// src/utils/pacing.ts
export const SPEED_MULT = 2.0; // global pacing (↑ = mais lento)

export const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Tween linear e lento, arredonda sempre em direção ao alvo */
export function tweenHp(
  from: number,
  to: number,
  setter: (v: number) => void,
  duration?: number
) {
  const d = duration ?? 1800;
  const start = performance.now();
  const diff = to - from;
  const decreasing = diff < 0;

  function step(now: number) {
    const t = Math.min(1, (now - start) / d);
    const value = from + diff * t; // linear
    setter(
      decreasing
        ? Math.max(to, Math.floor(value))
        : Math.min(to, Math.ceil(value))
    );
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/** duração proporcional ao dano, a um ritmo constante */
export function hpTweenDuration(from: number, to: number) {
  const delta = Math.abs(from - to);
  // ~50ms por HP; clamp antes do multiplicador global
  const base = Math.max(1200, Math.min(3500, Math.round(delta * 50)));
  return Math.round(base * SPEED_MULT);
}
