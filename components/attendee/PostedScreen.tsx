"use client";

import styles from "./PostedScreen.module.css";

export function PostedScreen({
  auto,
  previewUrl,
  onWatch,
  onShootAnother,
}: {
  auto: boolean;
  previewUrl: string;
  onWatch: () => void;
  onShootAnother: () => void;
}) {
  const bg = auto ? "var(--color-accent)" : "var(--color-ink)";
  const kicker = auto ? "ON THE WALL" : "WITH THE STEWARD";
  const title = auto ? "It is up." : "Sent for a look.";
  const body = auto
    ? "It's in the rotation now — keep an eye on the monitor by the door."
    : "A steward at the desk will wave it through, then it'll join the rotation.";

  return (
    <div className={styles.screen} style={{ background: bg }}>
      <div className={styles.kicker}>{kicker}</div>
      <div className={styles.rule} />
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.body}>{body}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={previewUrl} alt="" className={styles.photo} />
      <div className={styles.actions}>
        <button type="button" className={styles.watch} style={{ color: bg }} onClick={onWatch}>
          <span>WATCH THE WALL</span>
          <span className={styles.arrow}>→</span>
        </button>
        <button type="button" className={styles.again} onClick={onShootAnother}>
          Shoot another
        </button>
      </div>
    </div>
  );
}
