"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./PinScreen.module.css";

const STEWARD_PIN = "SS26";

export function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (pin.trim().toUpperCase() === STEWARD_PIN) {
      onUnlock();
      return;
    }
    setError("Incorrect code.");
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.title}>STEWARD ACCESS</div>
        <div className={styles.subtitle}>Enter the staff code to continue.</div>
        <input
          className={styles.input}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="CODE"
          maxLength={12}
          autoFocus
          autoComplete="off"
        />
        {error && <div className={styles.error}>{error}</div>}
        <button type="button" className={styles.submit} onClick={submit}>
          <span>ENTER</span>
          <span className={styles.arrow}>→</span>
        </button>
        <Link href="/" className={styles.back}>
          ← BACK TO HOME
        </Link>
      </div>
    </div>
  );
}
