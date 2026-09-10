"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import styles from "./MonitorView.module.css";
import type { Snapshot } from "@/lib/snapshot";
import { heroPhoto, queuePhotos, liveOnly } from "@/lib/deriveView";
import { formatAgo } from "@/lib/format";

export function MonitorView({ snapshot, now }: { snapshot: Snapshot; now: number }) {
  const [qr, setQr] = useState<string | null>(null);
  const live = liveOnly(snapshot.photos);
  const hero = heroPhoto(snapshot);
  const queue = queuePhotos(snapshot, 4);

  useEffect(() => {
    const url = `${window.location.origin}/?code=${snapshot.code}`;
    QRCode.toDataURL(url, { margin: 0, width: 240, color: { dark: "#201e1dff", light: "#ffffffff" } })
      .then(setQr)
      .catch(() => setQr(null));
  }, [snapshot.code]);

  return (
    <div className={styles.wall}>
      <div className={styles.header}>
        <div className={styles.brand}>SOULSCAPE</div>
        <div className={styles.live}>LIVE FROM THE ROOM</div>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span className={styles.badgeText}>{live.length} PICTURES</span>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.heroPanel}>
          {hero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hero.imageUrl} alt="" className={`${styles.heroImg} grayscale`} />
          ) : (
            <div className={styles.heroEmpty}>Waiting for the first picture…</div>
          )}
          {hero && (
            <div className={styles.heroOverlay}>
              <div className={styles.heroMetaTop}>
                {formatAgo(hero.createdAt, now)}
                {snapshot.showPrompts ? ` · PROMPT ${String(hero.promptNo).padStart(2, "0")}` : ""}
              </div>
              <div className={styles.heroIdentity}>
                <div className={styles.heroInitials}>{hero.initials}</div>
                <div className={styles.heroAuthor}>{hero.author}</div>
              </div>
            </div>
          )}
        </div>
        <div className={styles.queueCol}>
          <div className={styles.queueLabel}>NEXT UP</div>
          <div className={styles.queueList}>
            {queue.map((p) => (
              <div key={p.id} className={styles.queueItem}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt="" className={`${styles.queueImg} grayscale`} />
                <div className={styles.queueCaption}>{p.author}</div>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 4 - queue.length) }).map((_, i) => (
              <div key={`empty-${i}`} className={styles.queueItemEmpty} />
            ))}
          </div>
          <div className={styles.qrRow}>
            <div className={styles.qrBox}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {qr && <img src={qr} alt="QR code to join the wall" className={styles.qrImg} />}
            </div>
            <div className={styles.qrText}>
              Scan to add yours
              <br />
              <span className={styles.qrCode}>{snapshot.code}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
