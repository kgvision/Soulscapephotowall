"use client";

// Small corner mark for photos once they're color throughout — meant to sit
// inside a `position: relative` photo container. Purely decorative, so it's
// excluded from the accessibility tree.
export function Watermark({ size = 40 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/soulscape-logo.png"
      alt=""
      aria-hidden="true"
      style={{
        position: "absolute",
        right: "4%",
        bottom: "4%",
        width: size,
        height: "auto",
        opacity: 0.92,
        filter: "drop-shadow(0 1px 3px rgba(0,0,0,.55))",
        pointerEvents: "none",
      }}
    />
  );
}
