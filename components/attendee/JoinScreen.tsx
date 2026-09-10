"use client";

import { useState } from "react";
import { CodeCells } from "./CodeCells";
import { QrScanModal } from "./QrScanModal";
import styles from "./JoinScreen.module.css";
import { joinShow } from "@/lib/api";
import { saveIdentity } from "@/lib/identity";

export function JoinScreen({
  initialCode,
  initialName,
  onJoined,
}: {
  initialCode: string;
  initialName: string;
  onJoined: (name: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);

  async function submit() {
    if (submitting) return;
    setError(null);
    if (!name.trim()) {
      setError("Enter your first name.");
      return;
    }
    if (code.length < 6) {
      setError("Enter the full 6-character show code.");
      return;
    }
    setSubmitting(true);
    const res = await joinShow(code, name.trim());
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong.");
      return;
    }
    saveIdentity(name.trim());
    onJoined(name.trim());
  }

  function handleScanResult(text: string) {
    setScanning(false);
    try {
      const url = new URL(text);
      const fromUrl = url.searchParams.get("code");
      if (fromUrl) {
        setCode(fromUrl.toUpperCase());
        return;
      }
    } catch {
      // not a URL — treat as a raw code below
    }
    setCode(
      text
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6),
    );
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

      <div className={styles.fieldLabel}>SHOW CODE</div>
      <CodeCells value={code} onChange={setCode} disabled={submitting} />

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={submit} disabled={submitting}>
          <span>{submitting ? "JOINING…" : "JOIN THE WALL"}</span>
          <span className={styles.arrow}>→</span>
        </button>
        <button type="button" className={styles.secondary} onClick={() => setScanning(true)}>
          Scan the QR on the monitor instead
        </button>
      </div>

      <div className={styles.info}>
        <div className={styles.infoIcon}>i</div>
        <div className={styles.infoText}>Your first name shows with the photo. A steward can take anything down.</div>
      </div>

      {scanning && <QrScanModal onResult={handleScanResult} onClose={() => setScanning(false)} />}
    </div>
  );
}
