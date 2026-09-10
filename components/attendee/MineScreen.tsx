"use client";

import styles from "./MineScreen.module.css";
import type { Snapshot } from "@/lib/snapshot";
import { formatAgo, formatOnScreen, initialsFor } from "@/lib/format";

type Photo = Snapshot["photos"][number];

function statusMeta(p: Photo, now: number) {
  const promptLabel = `Prompt ${String(p.promptNo).padStart(2, "0")}`;
  if (p.status === "pending") {
    return {
      label: "WITH STEWARD",
      tagBg: "var(--color-accent-tint)",
      tagFg: "var(--color-accent-deep)",
      meta: `${promptLabel} · added ${formatAgo(p.createdAt, now)}`,
    };
  }
  if (p.status === "removed") {
    return {
      label: "REMOVED",
      tagBg: "var(--color-neutral-200)",
      tagFg: "var(--color-neutral-700)",
      meta: `${promptLabel} · taken down`,
    };
  }
  if (p.timesShown > 0) {
    return {
      label: "ON THE WALL",
      tagBg: "var(--color-accent)",
      tagFg: "#fff",
      meta: `${promptLabel} · shown ${p.timesShown}× · ${formatOnScreen(p.msOnScreen)}`,
    };
  }
  return {
    label: "ON THE WALL",
    tagBg: "var(--color-accent)",
    tagFg: "#fff",
    meta: `${promptLabel} · waiting to appear`,
  };
}

export function MineScreen({
  snapshot,
  now,
  myName,
  myOwnerId,
}: {
  snapshot: Snapshot;
  now: number;
  myName: string;
  myOwnerId: string;
}) {
  const mine = snapshot.photos.filter((p) => p.ownerId === myOwnerId);

  return (
    <div className={styles.screen}>
      <div className={styles.topBar}>
        <div className={styles.topRow}>
          <div>
            <div className={styles.kicker}>{myName} · SOULSCAPE</div>
            <div className={styles.heading}>My Pictures</div>
          </div>
          <div className={styles.avatar}>{initialsFor(myName)}</div>
        </div>
        <div className={styles.rule} />
      </div>
      <div className={styles.scroll}>
        {mine.length === 0 && <div className={styles.empty}>Nothing yet — shoot your first picture.</div>}
        {mine.map((p) => {
          const meta = statusMeta(p, now);
          return (
            <div key={p.id} className={styles.row}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt="" className={`${styles.thumb} grayscale`} />
              <div className={styles.rowBody}>
                <div className={styles.tag} style={{ background: meta.tagBg, color: meta.tagFg }}>
                  {meta.label}
                </div>
                <div className={styles.meta}>{meta.meta}</div>
              </div>
            </div>
          );
        })}
        <div className={styles.footerNote}>Everything you post is yours. A steward can take anything down.</div>
      </div>
    </div>
  );
}
