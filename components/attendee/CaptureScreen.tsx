"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CaptureScreen.module.css";

export function CaptureScreen({
  promptNo,
  promptText,
  onClose,
  onCaptured,
}: {
  promptNo: number;
  promptText: string;
  onClose: () => void;
  onCaptured: (blob: Blob) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        setError("Camera unavailable — choose a photo instead.");
      }
    })();
    return () => {
      stopped = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function shoot() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !ready) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) onCaptured(blob);
      },
      "image/jpeg",
      0.9,
    );
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onCaptured(file);
    e.target.value = "";
  }

  return (
    <div className={styles.screen}>
      <div className={styles.topBar}>
        <button type="button" className={styles.close} onClick={onClose}>
          CLOSE
        </button>
        <div className={styles.kicker}>PROMPT {String(promptNo).padStart(2, "0")} · SOULSCAPE</div>
      </div>

      <div className={styles.viewport}>
        {error ? (
          <div className={styles.fallback}>
            <p>{error}</p>
            <button type="button" className={styles.fallbackBtn} onClick={() => fileInputRef.current?.click()}>
              CHOOSE A PHOTO
            </button>
          </div>
        ) : (
          <video ref={videoRef} className={`${styles.video} grayscale`} muted playsInline />
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFile}
      />

      <div className={styles.promptRow}>{promptText}</div>
      <div className={styles.actionRow}>
        <button type="button" className={styles.shoot} onClick={ready ? shoot : () => fileInputRef.current?.click()}>
          {ready ? "SHOOT" : "CHOOSE PHOTO"}
        </button>
      </div>
    </div>
  );
}
