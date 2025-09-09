import { useEffect, useState } from "react";
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
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (spriteUrl === current) return;
    // Briefly hide, then show new sprite with a simple slide-in
    setBlink(true);
    const t = setTimeout(() => {
      setCurrent(spriteUrl);
      setBlink(false);
    }, 120);
    return () => clearTimeout(t);
  }, [spriteUrl, current]);

  const enterClass =
    side === "player" ? "simple-enter-left" : "simple-enter-right";

  const wrapperStyle = size != null ? { width: size, height: size } : undefined;
  const wrapperClass =
    size == null
      ? "relative w-full h-full"
      : side === "enemy"
      ? "relative"
      : "";

  return (
    <div className={`${wrapperClass} ${className}`} style={wrapperStyle}>
      {/* Invisible baseline to preserve layout height/width */}
      {!blink && current && (
        <div className={`absolute bottom-0 inset-0 ${enterClass}`}>
          <Sprite spriteUrl={current} size={size} player={side === "player"} />
        </div>
      )}
    </div>
  );
}
