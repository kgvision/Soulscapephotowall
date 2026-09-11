"use client";

import styles from "./StewardView.module.css";
import type { Snapshot } from "@/lib/snapshot";
import { formatAgo } from "@/lib/format";
import { approvePhotoRequest, removePhotoRequest, toggleHoldRequest, pushPromptRequest } from "@/lib/api";

export function StewardView({ snapshot, now }: { snapshot: Snapshot; now: number }) {
  const live = snapshot.photos.filter((p) => p.status === "live").length;
  const rows = snapshot.photos
    .filter((p) => p.status !== "removed")
    .slice()
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
      return b.createdAt - a.createdAt;
    })
    .slice(0, 20);

  return (
    <div className={styles.page}>
      <div className={styles.console}>
        <div className={styles.header}>
          <div className={styles.title}>STEWARD</div>
          <div className={styles.subtitle}>SOULSCAPE / WALL 1</div>
          <button
            type="button"
            className={styles.holdBtn}
            data-held={snapshot.hold ? "" : undefined}
            onClick={() => toggleHoldRequest()}
          >
            {snapshot.hold ? "WALL HELD" : "HOLD WALL"}
          </button>
        </div>
        <div className={styles.holdNote}>
          {snapshot.hold
            ? "Rotation frozen on the current picture. Nothing new reaches the screen until you release."
            : `Rotation running. ${live} picture${live === 1 ? "" : "s"} in the loop, newest first.`}
        </div>
        <div className={styles.rows}>
          {rows.length === 0 && <div className={styles.empty}>No pictures yet.</div>}
          {rows.map((p) => (
            <div key={p.id} className={styles.row}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt="" className={styles.thumb} />
              <div className={styles.rowBody}>
                <div className={styles.author}>{p.author}</div>
                <div className={styles.ago}>
                  {p.status === "pending" ? "AWAITING APPROVAL · " : ""}
                  {formatAgo(p.createdAt, now)}
                </div>
              </div>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => (p.status === "pending" ? approvePhotoRequest(p.id) : removePhotoRequest(p.id))}
              >
                {p.status === "pending" ? "APPROVE" : "REMOVE"}
              </button>
            </div>
          ))}
        </div>
        <div className={styles.footer}>
          <button type="button" className={styles.promptBtn} onClick={() => pushPromptRequest()}>
            PUSH NEXT PROMPT
          </button>
          <div className={styles.promptState}>Prompt {snapshot.promptNo} of 6 live</div>
        </div>
      </div>
    </div>
  );
}
