"use client";

import { useLiveState } from "@/hooks/useLiveState";
import { StewardView } from "@/components/steward/StewardView";
import styles from "./page.module.css";

export default function StewardPage() {
  const { state, now } = useLiveState();

  if (!state) {
    return <div className={styles.connecting}>Connecting…</div>;
  }

  return <StewardView snapshot={state} now={now} />;
}
