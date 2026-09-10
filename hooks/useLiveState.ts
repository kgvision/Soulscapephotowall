"use client";

import { useEffect, useState } from "react";
import type { Snapshot } from "@/lib/snapshot";

export function useLiveState() {
  const [state, setState] = useState<Snapshot | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const es = new EventSource("/api/events");
    es.onmessage = (e) => {
      try {
        setState(JSON.parse(e.data));
        setNow(Date.now());
      } catch {
        // ignore malformed frame
      }
    };
    const tick = setInterval(() => setNow(Date.now()), 15000);
    return () => {
      es.close();
      clearInterval(tick);
    };
  }, []);

  return { state, now };
}
