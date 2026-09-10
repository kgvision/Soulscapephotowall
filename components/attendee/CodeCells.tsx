"use client";

import { useRef } from "react";
import styles from "./CodeCells.module.css";

const LENGTH = 6;
const ACCENT_FROM = 4;

export function CodeCells({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  function setAt(i: number, ch: string) {
    const chars = value.padEnd(LENGTH, " ").split("");
    chars[i] = ch;
    const next = chars.join("").replace(/\s+$/, "");
    onChange(next.toUpperCase());
    if (ch && i < LENGTH - 1) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, LENGTH);
    onChange(text);
    inputs.current[Math.min(text.length, LENGTH - 1)]?.focus();
  }

  return (
    <div className={styles.row}>
      {Array.from({ length: LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          className={styles.cell}
          data-accent={i >= ACCENT_FROM ? "" : undefined}
          value={value[i] ?? ""}
          disabled={disabled}
          maxLength={1}
          inputMode="text"
          autoCapitalize="characters"
          onChange={(e) => setAt(i, e.target.value.toUpperCase().slice(-1))}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          aria-label={`Show code character ${i + 1}`}
        />
      ))}
    </div>
  );
}
