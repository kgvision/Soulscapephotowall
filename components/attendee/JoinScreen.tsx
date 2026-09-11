"use client";

import { useState } from "react";
import styles from "./JoinScreen.module.css";
import { joinShow } from "@/lib/api";
import { saveIdentity } from "@/lib/identity";

export function JoinScreen({
  initialName,
  onJoined,
}: {
  initialName: string;
  onJoined: (name: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (submitting) return;
    setError(null);
    if (!name.trim()) {
      setError("Enter your first name.");
      return;
    }
    setSubmitting(true);
    const res = await joinShow(name.trim());
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong.");
      return;
    }
    saveIdentity(name.trim(), handle.trim());
    onJoined(name.trim());
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/soulscape-logo.png" alt="Soulscape Art Collective" width={132} height={90} className={styles.logo} />
        <div className={styles.wordmark}>
          PHOTO
          <br />
          WALL
        </div>
      </div>
      <div className={styles.rule} />

      <h1 className={styles.title}>Add your picture to the show!</h1>
      <p className={styles.subtitle}>Shoot it and it goes up on the monitor!</p>

      <label className={styles.fieldLabel} htmlFor="join-name">
        YOUR FIRST NAME
      </label>
      <input
        id="join-name"
        className={styles.nameInput}
        value={name}
        maxLength={24}
        placeholder="e.g. Mara"
        onChange={(e) => setName(e.target.value)}
        autoComplete="given-name"
      />

      <label className={styles.fieldLabel} htmlFor="join-handle">
        / SOCIAL MEDIA HANDLE
      </label>
      <input
        id="join-handle"
        className={styles.nameInput}
        value={handle}
        maxLength={30}
        placeholder="@yourhandle (optional)"
        onChange={(e) => setHandle(e.target.value)}
        autoComplete="off"
      />

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={submit} disabled={submitting}>
          <span>{submitting ? "JOINING…" : "JOIN THE WALL"}</span>
          <span className={styles.arrow}>→</span>
        </button>
      </div>

      <div className={styles.info}>
        <div className={styles.infoIcon}>i</div>
        <div className={styles.infoText}>Your first name shows with the photo. A steward can take anything down.</div>
      </div>
    </div>
  );
}
