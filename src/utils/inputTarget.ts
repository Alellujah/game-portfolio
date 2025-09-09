export type KeyTarget = HTMLElement | null;

declare global {
  interface Window {
    __keyTarget?: KeyTarget;
  }
}

export function setKeyTarget(el: KeyTarget) {
  window.__keyTarget = el ?? undefined;
}

export function getKeyTarget(): KeyTarget {
  return window.__keyTarget ?? null;
}

