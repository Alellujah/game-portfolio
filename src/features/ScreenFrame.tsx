import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  // Adds faint CRT-style scanlines over the screen
  scanlines?: boolean;
  // Opacity for scanlines overlay (0..1)
  scanlineOpacity?: number;
  // Optional caption centered on the bottom bezel
  label?: string;
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
}: Props) {
  return (
    <div className="w-full min-h-screen snes-bg py-8 flex justify-center items-start">
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
          <div className="relative rounded-lg overflow-hidden bg-black">
            {children}
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
    </div>
  );
}

export default ScreenFrame;
