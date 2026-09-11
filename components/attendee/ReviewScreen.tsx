"use client";

import styles from "./ReviewScreen.module.css";

export function ReviewScreen({
  previewUrl,
  myName,
  promptNo,
  moderationNote,
  submitting,
  onReshoot,
  onClose,
  onPost,
}: {
  previewUrl: string;
  myName: string;
  promptNo: number;
  moderationNote: string;
  submitting: boolean;
  onReshoot: () => void;
  onClose: () => void;
  onPost: () => void;
}) {
  return (
    <div className={styles.screen}>
      <div className={styles.topBar}>
        <button type="button" className={styles.reshoot} onClick={onReshoot} disabled={submitting}>
          ← BACK
        </button>
        <button type="button" className={styles.close} onClick={onClose} disabled={submitting}>
          ✕ CLOSE
        </button>
      </div>
      <div className={styles.rule} />
      <div className={styles.body}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt="" className={styles.photo} />
        <div className={styles.metaRow}>
          <span>SHOWS AS &quot;{myName}&quot;</span>
          <span>PROMPT {String(promptNo).padStart(2, "0")}</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.note}>
          <div className={styles.noteIcon}>↗</div>
          <div className={styles.noteText}>{moderationNote}</div>
        </div>
      </div>
      <div className={styles.actionRow}>
        <button type="button" className={styles.send} onClick={onPost} disabled={submitting}>
          <span>{submitting ? "SENDING…" : "SEND TO THE WALL"}</span>
          <span className={styles.arrow}>→</span>
        </button>
      </div>
    </div>
  );
}
