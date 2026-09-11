"use client";

import styles from "./FeedScreen.module.css";
import type { Snapshot } from "@/lib/snapshot";
import { heroPhoto, gridPhotos, liveOnly } from "@/lib/deriveView";
import { formatAgo } from "@/lib/format";
import { Watermark } from "@/components/shared/Watermark";

export function FeedScreen({
  snapshot,
  now,
  onGoHome,
}: {
  snapshot: Snapshot;
  now: number;
  onGoHome: () => void;
}) {
  const live = liveOnly(snapshot.photos);
  const hero = heroPhoto(snapshot);
  const grid = gridPhotos(snapshot, 8);

  return (
    <div className={styles.screen}>
      <div className={styles.topBar}>
        <div className={styles.topRow}>
          <div>
            <button type="button" className={styles.kicker} onClick={onGoHome}>
              SOULSCAPE / ENTRANCE WALL
            </button>
            <div className={styles.heading}>The Wall</div>
          </div>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            <span className={styles.liveCount}>{live.length} LIVE</span>
          </div>
        </div>
        <div className={styles.rule} />
      </div>

      <div className={styles.scroll}>
        <div className={styles.heroSection}>
          <div className={styles.heroLabel}>ON SCREEN NOW</div>
          {hero ? (
            <div className={styles.heroWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.imageUrl} alt="" className={styles.hero} />
              <Watermark size={44} />
            </div>
          ) : (
            <div className={styles.heroEmpty}>Waiting for the first picture…</div>
          )}
          {hero && (
            <div className={styles.heroMeta}>
              <span className={styles.heroAuthor}>{hero.author}</span>
              <span className={styles.heroAgo}>{formatAgo(hero.createdAt, now)}</span>
            </div>
          )}
        </div>

        {snapshot.showPrompts && (
          <div className={styles.promptBanner}>
            <div className={styles.promptTag}>PROMPT {String(snapshot.promptNo).padStart(2, "0")}</div>
            <div className={styles.promptText}>{snapshot.promptText}</div>
          </div>
        )}

        <div className={styles.grid}>
          {grid.map((p) => (
            <div key={p.id} className={styles.tile}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt="" className={styles.tileImg} />
              <Watermark size={22} />
              <div className={styles.tileCaption}>
                {p.author} · {formatAgo(p.createdAt, now)}
              </div>
            </div>
          ))}
          {grid.length === 0 && <div className={styles.gridEmpty}>Be the first one up.</div>}
        </div>
      </div>
    </div>
  );
}
