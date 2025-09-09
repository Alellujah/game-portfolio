import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Container from "./layout/Container";
import { SPEED_MULT } from "../utils/pacing";

type Props = {
  message: string;
  speed?: number; // ms per character
  className?: string;
  waiting?: boolean; // show blinking dots when awaiting user input
  autoPageDelay?: number; // ms to wait before auto-advancing a full page
  charsPerTick?: number; // characters to reveal per tick
};

function BattleMessages({
  message,
  speed = 30,
  className = "",
  waiting = false,
  autoPageDelay = 1000,
  charsPerTick = 10,
}: Props) {
  const [displayed, setDisplayed] = useState("");
  const [pages, setPages] = useState<string[]>([]);
  const [pageIdx, setPageIdx] = useState(0);
  const [localWaiting, setLocalWaiting] = useState(false);

  const boxRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLParagraphElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const autoTimerRef = useRef<number | null>(null);

  // Clears any active typing interval
  const clearTyping = () => {
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Start typing out current page content
  const startTypingPage = (pageText: string) => {
    clearTyping();
    setDisplayed("");
    if (!pageText) return;
    // Render instantly if speed <= 0
    if (speed <= 0) {
      setDisplayed(pageText);
      setLocalWaiting(pageIdx < pages.length - 1);
      return;
    }
    let i = 0;
    const step = Math.max(1, Math.floor(charsPerTick));
    intervalRef.current = window.setInterval(() => {
      i += step;
      if (i >= pageText.length) {
        setDisplayed(pageText);
        clearTyping();
        setLocalWaiting(pageIdx < pages.length - 1);
      } else {
        setDisplayed(pageText.slice(0, i));
      }
    }, speed) as unknown as number;
  };

  // Compute how many pages fit in the available height by measuring text
  const recomputePages = () => {
    const full = message ?? "";
    const box = boxRef.current;
    const measure = measureRef.current;
    if (!box || !measure) {
      setPages([full]);
      setPageIdx(0);
      setDisplayed("");
      return;
    }

    // Prepare measurer styles (mirror visible paragraph)
    measure.style.whiteSpace = "pre-wrap";
    measure.style.wordBreak = "normal"; // don't break words arbitrarily
    measure.style.overflowWrap = "normal";
    measure.textContent = "";

    const maxH = box.clientHeight || 0;
    // If container has no fixed height (e.g., intro flow), don't paginate
    if (maxH < 12) {
      setPages([full]);
      setPageIdx(0);
      setDisplayed("");
      setLocalWaiting(false);
      return;
    }
    // If the whole text fits, avoid pagination entirely
    measure.textContent = full;
    if (measure.scrollHeight <= maxH) {
      setPages([full]);
      setPageIdx(0);
      setDisplayed("");
      setLocalWaiting(false);
      return;
    }

    const out: string[] = [];
    let start = 0;
    const N = full.length;

    while (start < N) {
      // Binary search largest substring from start that fits within maxH
      let lo = 1;
      let hi = N - start;
      let best = 0;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const slice = full.slice(start, start + mid);
        measure.textContent = slice;
        const h = measure.scrollHeight;
        if (h <= maxH) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      if (best <= 0) {
        // Fallback: force at least 1 character to avoid infinite loop
        best = 1;
      }
      // Prefer to end the page at a whitespace/newline so words aren't split
      if (start + best < N) {
        const slice = full.slice(start, start + best);
        // Look for a safe breakpoint
        let cut = Math.max(
          slice.lastIndexOf("\n"),
          slice.lastIndexOf(" "),
          slice.lastIndexOf("\t")
        );
        if (cut > 0) {
          best = cut + 1; // include the space/newline
        }
      }
      out.push(full.slice(start, start + best));
      start += best;
    }

    setPages(out);
    setPageIdx(0);
    setDisplayed("");
    setLocalWaiting(false);
    // Start typing first page on next effect
  };

  // Recompute pages whenever message changes or container resizes
  useLayoutEffect(() => {
    recomputePages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  // Recompute on window resize to keep pagination accurate
  useEffect(() => {
    const onResize = () => recomputePages();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  // Start typing when pages or page index change
  useEffect(() => {
    if (!pages.length) return;
    startTypingPage(pages[pageIdx] ?? "");
    return clearTyping;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, pageIdx, speed]);

  // Handle Enter/click to advance to next page when locally waiting
  useEffect(() => {
    if (!localWaiting) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        // Try to isolate this interaction from other global handlers
        if (typeof ev.stopImmediatePropagation === "function")
          ev.stopImmediatePropagation();
        setLocalWaiting(false);
        setPageIdx((i) => Math.min(i + 1, pages.length - 1));
      }
    };
    const onClick = () => {
      setLocalWaiting(false);
      setPageIdx((i) => Math.min(i + 1, pages.length - 1));
    };
    // Auto-advance after a delay if user doesn't press Enter
    const delay = Math.max(300, Math.round(autoPageDelay * SPEED_MULT));
    autoTimerRef.current = window.setTimeout(() => {
      setLocalWaiting(false);
      setPageIdx((i) => Math.min(i + 1, pages.length - 1));
    }, delay) as unknown as number;

    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
      if (autoTimerRef.current != null) {
        window.clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [localWaiting, pages.length, autoPageDelay]);

  const textClasses = "m-0 text-black text-xs whitespace-pre-wrap break-normal";

  return (
    <Container
      fixedWidth
      className={className}
      childrenClasses="absolute inset-0"
    >
      <div ref={boxRef} className="absolute inset-0 overflow-hidden p-5">
        <p className={textClasses}>
          {displayed}
          {(waiting || localWaiting) && (
            <span className="blinking-dots">...</span>
          )}
        </p>
        {/* Hidden measurer to compute page breaks without flashing */}
        <p
          ref={measureRef}
          aria-hidden
          className={`absolute left-0 top-0 invisible w-full ${textClasses}`}
        />
      </div>
    </Container>
  );
}

export default BattleMessages;
