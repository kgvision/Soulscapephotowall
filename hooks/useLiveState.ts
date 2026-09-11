"use client";

import { useEffect, useRef, useState } from "react";
import type { Snapshot } from "@/lib/snapshot";

// Polling, not a persistent connection: the shared state lives in Redis
// behind stateless serverless functions, and Vercel serverless functions
// have execution-duration limits that a long-lived SSE stream can't reliably
// stay under anyway. A ~2s poll reads as "live" for a photo wall without
// needing a push channel.
const POLL_INTERVAL_MS = 2000;

export function useLiveState() {
  const [state, setState] = useState<Snapshot | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const inFlight = useRef(false);

  useEffect(() => {
    let stopped = false;

    async function poll() {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        if (!stopped && res.ok) {
          const data = (await res.json()) as Snapshot;
          setState(data);
          setNow(Date.now());
        }
      } catch {
        // transient network error — next tick retries
      } finally {
        inFlight.current = false;
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, []);

  return { state, now };
}
