import { useCallback, useEffect, useState } from "react";
import Container from "../components/layout/Container";
import type { Page } from "./content";

const ADVANCE_KEYS = new Set(["Enter", " ", "z", "Z"]);

type Props = {
  pages: Page[];
  onClose: () => void;
};

/**
 * Overworld text box with a typewriter effect.
 * Enter/Space/Z (or a click) finishes the current page, then advances.
 */
export default function DialogBox({ pages, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [chars, setChars] = useState(0);
  const page = pages[index];
  const done = chars >= page.text.length;

  useEffect(() => {
    if (done) return;
    const t = window.setTimeout(() => setChars((c) => c + 2), 18);
    return () => window.clearTimeout(t);
  }, [chars, done]);

  const advance = useCallback(() => {
    if (!done) {
      setChars(page.text.length);
      return;
    }
    if (index + 1 < pages.length) {
      setIndex(index + 1);
      setChars(0);
    } else {
      onClose();
    }
  }, [done, index, page.text.length, pages.length, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (ADVANCE_KEYS.has(e.key)) {
        e.preventDefault();
        advance();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [advance, onClose]);

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="absolute left-2 right-2 bottom-2 z-20 cursor-pointer select-none"
      onClick={advance}
    >
      <Container fixedWidth className="w-full h-[118px]" childrenClasses="w-full">
        <p className="text-[13px] leading-6">{page.text.slice(0, chars)}</p>
        {done && page.link && (
          <a
            href={page.link.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[12px] text-blue-700 underline"
          >
            {page.link.label}
          </a>
        )}
        {done && (
          <span
            aria-hidden
            className="absolute right-4 bottom-3 blink-arrow"
            style={{
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "8px solid black",
            }}
          />
        )}
      </Container>
    </div>
  );
}
