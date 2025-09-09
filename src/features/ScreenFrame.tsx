import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { SCREEN_W, SCREEN_H } from "../config/ui";

type Props = PropsWithChildren<{
  // Adds faint CRT-style scanlines over the screen
  scanlines?: boolean;
  // Opacity for scanlines overlay (0..1)
  scanlineOpacity?: number;
  // Optional caption centered on the bottom bezel
  label?: string;
  // Show on-screen touch controls on small screens
  controls?: boolean;
}>;

/**
 * ScreenFrame
 *
 * A lightweight Super Game Boy-style shell around the game screen.
 * - Purple-gray console body with subtle bevel + screws
 * - Dark bezel around the "screen" cutout
 * - Optional scanlines overlay
 *
 * Drop in any fixed-size child (e.g., BattleScene at 160x144 scaled) and the
 * frame wraps it without stretching.
 */
function ScreenFrame({
  children,
  scanlines = true,
  scanlineOpacity = 0.65,
  label = "GAME BOY",
  controls = true,
}: Props) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const compute = () => {
      // Account for shell padding/margins roughly
      const avail = Math.max(240, window.innerWidth - 64); // px
      const s = Math.min(1, avail / SCREEN_W);
      setScale(s);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return (
    <div className="w-full min-h-screen snes-bg py-8 flex flex-col items-center">
      {/* Console shell */}
      <div
        className="relative inline-block rounded-[18px] shadow-md"
        style={{
          background:
            "linear-gradient(180deg, #7a6b75 0%, #6b5d66 40%, #62545d 100%)",
          padding: 12,
        }}
      >
        {/* Decorative screws */}
        <div className="pointer-events-none" aria-hidden>
          {(
            [
              "top-2 left-2",
              "top-2 right-2",
              "bottom-8 left-2",
              "bottom-8 right-2",
            ] as const
          ).map((pos, i) => (
            <span
              key={i}
              className={`absolute ${pos} w-3 h-3 rounded-full`}
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #cfc8cc 0 25%, #6b5c65 26% 100%)",
                boxShadow: "inset 0 0 1px #000, 0 1px 1px rgba(0,0,0,0.4)",
              }}
            />
          ))}
          {/* Power LED */}
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, #ff6b6b 0 35%, #9a2c2c 36% 100%)",
              boxShadow: "0 0 4px #ff6b6b88",
            }}
          />
        </div>

        {/* Bezel around the screen */}
        <div
          className="relative rounded-[14px] p-2 md:p-3"
          style={{
            background:
              "linear-gradient(180deg, #3a2f36 0%, #261f25 30%, #1b161b 100%)",
            boxShadow:
              "inset 0 1px 0 #544751, inset 0 -1px 0 #151015, 0 2px 8px rgba(0,0,0,0.25)",
          }}
        >
          {/* Actual screen area */}
          <div
            className="relative rounded-lg overflow-hidden bg-black"
            style={{ width: SCREEN_W * scale, height: SCREEN_H * scale }}
          >
            <div
              className="relative"
              style={{
                width: SCREEN_W,
                height: SCREEN_H,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              {children}
            </div>
            {scanlines && (
              <div
                className="scanlines pointer-events-none absolute inset-0 mix-blend-soft-light"
                style={{ opacity: scanlineOpacity }}
              />
            )}
            <div className="screen-vignette pointer-events-none absolute inset-0" />
          </div>

          {/* Bottom label */}
          {label && (
            <div className="text-center select-none">
              <span className="text-xs text-white tracking-widest">
                {label}
              </span>
            </div>
          )}
        </div>
      </div>
      {/* On-screen controls for mobile */}
      {controls && <MobileControls />}
    </div>
  );
}

export default ScreenFrame;

function MobileControls() {
  const repeatTimeout = useRef<number | null>(null);
  const repeatInterval = useRef<number | null>(null);
  function fire(key: string) {
    const evt = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
    });
    const target = (document.activeElement as HTMLElement) ?? document.body;
    try {
      target.dispatchEvent(evt);
    } catch {
      window.dispatchEvent(evt);
    }
  }
  function clearRepeat() {
    if (repeatTimeout.current != null) {
      window.clearTimeout(repeatTimeout.current);
      repeatTimeout.current = null;
    }
    if (repeatInterval.current != null) {
      window.clearInterval(repeatInterval.current);
      repeatInterval.current = null;
    }
  }
  function press(key: string) {
    clearRepeat();
    fire(key);
    repeatTimeout.current = window.setTimeout(() => {
      repeatInterval.current = window.setInterval(
        () => fire(key),
        140
      ) as unknown as number;
    }, 280) as unknown as number;
  }

  const btnBase =
    "active:scale-95 transition-transform select-none touch-manipulation";
  const btnRound =
    "rounded-full w-14 h-14 grid place-items-center text-white font-bold shadow-md";
  const padBtn =
    "rounded-md w-12 h-12 grid place-items-center text-white font-bold shadow-md";

  return (
    <div className="md:hidden mt-5 w-full max-w-xl px-6 flex items-center justify-between">
      {/* D-Pad */}
      <div className="grid grid-cols-3 gap-2">
        <div />
        <button
          tabIndex={-1}
          aria-label="Up"
          className={`${padBtn} ${btnBase}`}
          style={{ background: "#3b3b3b" }}
          onPointerDown={(e) => {
            e.preventDefault();
            press("ArrowUp");
          }}
          onPointerUp={clearRepeat}
          onPointerCancel={clearRepeat}
          onPointerLeave={clearRepeat}
        >
          ▲
        </button>
        <div />
        <button
          tabIndex={-1}
          aria-label="Left"
          className={`${padBtn} ${btnBase}`}
          style={{ background: "#3b3b3b" }}
          onPointerDown={(e) => {
            e.preventDefault();
            press("ArrowLeft");
          }}
          onPointerUp={clearRepeat}
          onPointerCancel={clearRepeat}
          onPointerLeave={clearRepeat}
        >
          ◀
        </button>
        <div />
        <button
          tabIndex={-1}
          aria-label="Right"
          className={`${padBtn} ${btnBase}`}
          style={{ background: "#3b3b3b" }}
          onPointerDown={(e) => {
            e.preventDefault();
            press("ArrowRight");
          }}
          onPointerUp={clearRepeat}
          onPointerCancel={clearRepeat}
          onPointerLeave={clearRepeat}
        >
          ▶
        </button>
        <div />
        <button
          tabIndex={-1}
          aria-label="Down"
          className={`${padBtn} ${btnBase}`}
          style={{ background: "#3b3b3b" }}
          onPointerDown={(e) => {
            e.preventDefault();
            press("ArrowDown");
          }}
          onPointerUp={clearRepeat}
          onPointerCancel={clearRepeat}
          onPointerLeave={clearRepeat}
        >
          ▼
        </button>
        <div />
      </div>

      {/* A/B buttons */}
      <div className="flex gap-4">
        <button
          tabIndex={-1}
          aria-label="B (Cancel)"
          className={`${btnRound} ${btnBase}`}
          style={{ background: "#6b5d66" }}
          onPointerDown={(e) => {
            e.preventDefault();
            fire("Escape");
          }}
        >
          B
        </button>
        <button
          tabIndex={-1}
          aria-label="A (Confirm)"
          className={`${btnRound} ${btnBase}`}
          style={{ background: "#9a2c2c" }}
          onPointerDown={(e) => {
            e.preventDefault();
            fire("Enter");
          }}
        >
          A
        </button>
      </div>
    </div>
  );
}
