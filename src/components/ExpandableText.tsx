"use client";

import { useEffect, useRef, useState } from "react";

/** Description with inline more../less.. at the end of the last visible line. */
export function ExpandableText({
  text,
  className = "",
  lines = 2,
}: {
  text: string;
  className?: string;
  lines?: 2 | 3;
}) {
  const [expanded, setExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);
  const [clipped, setClipped] = useState(text);
  const measureRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const styles = getComputedStyle(el);
    const lineHeight = parseFloat(styles.lineHeight) || 22;
    const maxH = lineHeight * lines + 1;

    el.textContent = text;
    if (el.scrollHeight <= maxH) {
      setNeedsToggle(false);
      setClipped(text);
      return;
    }

    setNeedsToggle(true);
    const suffix = "… more..";
    let lo = 0;
    let hi = text.length;
    let best = 0;

    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      el.textContent = `${text.slice(0, mid).trimEnd()}${suffix}`;
      if (el.scrollHeight <= maxH) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    setClipped(`${text.slice(0, best).trimEnd()}…`);
  }, [text, lines]);

  if (!text.trim()) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Hidden measurer — same typography as visible copy */}
      <p
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 w-full text-[15px] leading-relaxed"
      />

      <p className="text-[15px] leading-relaxed text-white/75">
        {expanded ? text : clipped}
        {needsToggle ? (
          <>
            {" "}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline font-semibold text-white underline-offset-2 hover:underline"
            >
              {expanded ? "less.." : "more.."}
            </button>
          </>
        ) : null}
      </p>
    </div>
  );
}
