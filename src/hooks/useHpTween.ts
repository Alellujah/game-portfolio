// src/hooks/useHpTween.ts
import { useEffect, useRef, useState } from "react";
import { hpTweenDuration, tweenHp } from "../utils/pacing";

export default function useHpTween(initial: number) {
  const [disp, setDisp] = useState(initial);
  const ref = useRef(disp);
  useEffect(() => {
    ref.current = disp;
  }, [disp]);

  const reset = (v: number) => setDisp(v);

  const to = (target: number) => {
    const from = ref.current;
    const dur = hpTweenDuration(from, target);
    tweenHp(from, target, setDisp, dur);
    return dur; // útil para sincronizar waits
  };

  return { disp, reset, to, ref };
}
