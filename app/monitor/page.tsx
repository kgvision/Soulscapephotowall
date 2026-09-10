"use client";

import { useLiveState } from "@/hooks/useLiveState";
import { MonitorView } from "@/components/monitor/MonitorView";
import styles from "./page.module.css";

export default function MonitorPage() {
  const { state, now } = useLiveState();

  if (!state) {
    return <div className={styles.connecting}>Connecting…</div>;
  }

  return <MonitorView snapshot={state} now={now} />;
}
