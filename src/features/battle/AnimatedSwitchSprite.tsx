import { useEffect, useRef, useState } from "react";
import Sprite from "../../components/Sprite";

type Props = {
  spriteUrl?: string;
  size?: number; // if undefined, fills available space (100%)
  side: "enemy" | "player";
  className?: string;
};

/**
 * Renders a sprite with a simple out/in transition when the `spriteUrl` changes.
 * - Player side slides left on exit, enters from left
 * - Enemy side slides right on exit, enters from right
 */
export default function AnimatedSwitchSprite({
  spriteUrl,
  size,
  side,
  className = "",
}: Props) {
  const [current, setCurrent] = useState<string | undefined>(spriteUrl);
  const [prev, setPrev] = useState<string | undefined>(undefined);
  const animatingRef = useRef(false);

  useEffect(() => {
    if (spriteUrl === current) return;
    // Start exit animation for previous sprite
    setPrev(current);
    animatingRef.current = true;
    const t = setTimeout(() => {
      setCurrent(spriteUrl);
      // allow exit to finish before clearing prev
      const t2 = setTimeout(() => {
        setPrev(undefined);
        animatingRef.current = false;
      }, 200);
      return () => clearTimeout(t2);
    }, 200);
    return () => clearTimeout(t);
  }, [spriteUrl, current]);

  const exitClass =
    side === "player" ? "switch-exit-left" : "switch-exit-right";
  const enterClass =
    side === "player" ? "switch-enter-left" : "switch-enter-right";

  const wrapperStyle = size != null ? { width: size, height: size } : undefined;
  const wrapperClass = size == null ? "relative w-full h-full" : "relative";

  return (
    <div className={`${wrapperClass} ${className}`} style={wrapperStyle}>
      {/* Invisible baseline to preserve layout height/width */}
      <div className="invisible">
        <Sprite spriteUrl={current || prev} size={size} />
      </div>
      {prev && (
        <div className={`absolute inset-0 ${exitClass}`}>
          <Sprite spriteUrl={prev} size={size} />
          <div
            className={`switch-dust ${
              side === "player" ? "from-left" : "from-right"
            }`}
          >
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
      {current && (
        <div className={`absolute inset-0 ${prev ? enterClass : ""}`}>
          <Sprite spriteUrl={current} size={size} />
          {prev && (
            <div
              className={`switch-dust ${
                side === "player" ? "from-left" : "from-right"
              }`}
            >
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
