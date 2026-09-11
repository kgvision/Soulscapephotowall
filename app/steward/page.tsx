"use client";

import { useEffect, useState } from "react";
import { useLiveState } from "@/hooks/useLiveState";
import { StewardView } from "@/components/steward/StewardView";
import { PinScreen } from "@/components/steward/PinScreen";
import styles from "./page.module.css";

const AUTH_KEY = "soulscape_steward_authed";

export default function StewardPage() {
  const { state, now } = useLiveState();
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect --
       One-time hydration from sessionStorage on mount — window is unavailable
       during the server render, so this can't be a lazy useState initializer. */
    try {
      setUnlocked(window.sessionStorage.getItem(AUTH_KEY) === "1");
    } catch {
      // storage unavailable — fall through to the pin screen
    }
    setChecked(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function handleUnlock() {
    try {
      window.sessionStorage.setItem(AUTH_KEY, "1");
    } catch {
      // storage unavailable — still unlock for this render
    }
    setUnlocked(true);
  }

  if (!checked) {
    return <div className={styles.connecting}>Connecting…</div>;
  }
  if (!unlocked) {
    return <PinScreen onUnlock={handleUnlock} />;
  }
  if (!state) {
    return <div className={styles.connecting}>Connecting…</div>;
  }

  return <StewardView snapshot={state} now={now} />;
}
