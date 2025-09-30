import { useCallback, useEffect } from "react";

const BLINK_CSS = `
@keyframes oldschool-blink { 0%,49% { opacity: 1 } 50%,100% { opacity: 0 } }
.blink { animation: oldschool-blink 2s steps(2, end) infinite; }
`;

/**
 * Minimal splash screen overlay. Press Enter or click to continue.
 */
const SplashScreen: React.FC<{ title?: string; onStart: () => void }> = ({
  onStart,
}) => {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onStart();
      }
    },
    [onStart]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div
      onClick={onStart}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg text-black select-none"
      role="button"
      aria-label="Start game"
      tabIndex={0}
    >
      <style>{BLINK_CSS}</style>

      <img src="splash.png" />

      <div className="text-center px-6">
        <h1 className="text-xl md:text-xl blink">
          Press <span className="px-2 py-1 rounded bg-white/10">Enter</span> to
          Play
        </h1>
        <p className="opacity-80">(or click anywhere)</p>
      </div>
    </div>
  );
};

export default SplashScreen;
