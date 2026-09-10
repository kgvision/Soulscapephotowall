"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CaptureScreen.module.css";

// Keeps the captured frame (and therefore the canvas draw + JPEG encode on
// tap) fast on phones that would otherwise hand back a multi-megapixel
// frame — that encode was the "SHOOT does nothing for a few seconds" lag.
const IDEAL_WIDTH = 1280;
const IDEAL_HEIGHT = 960;
const MAX_CAPTURE_EDGE = 1600;

function FlipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 5.5a6 6 0 0 1 10.5-3.2M2 5.5V2M2 5.5h3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 10.5a6 6 0 0 1-10.5 3.2M14 10.5V14M14 10.5h-3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CaptureScreen({
  hidden = false,
  promptNo,
  promptText,
  onClose,
  onCaptured,
}: {
  hidden?: boolean;
  promptNo: number;
  promptText: string;
  onClose: () => void;
  onCaptured: (blob: Blob) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Guards against a double-tap firing shoot() twice before React re-renders
  // with capturing=true — state updates aren't synchronous, a ref is.
  const capturingRef = useRef(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: IDEAL_WIDTH },
            height: { ideal: IDEAL_HEIGHT },
          },
          audio: false,
        });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setError(null);
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
  }, [facing]);

  function toggleFacing() {
    setFacing((f) => (f === "environment" ? "user" : "environment"));
  }

  function shoot() {
    if (capturingRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !ready || !video.videoWidth || !video.videoHeight) return;
    capturingRef.current = true;
    setCapturing(true);

    const scale = Math.min(1, MAX_CAPTURE_EDGE / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      capturingRef.current = false;
      setCapturing(false);
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        capturingRef.current = false;
        setCapturing(false);
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
    <div className={styles.screen} style={hidden ? { display: "none" } : undefined}>
      <div className={styles.topBar}>
        <button type="button" className={styles.close} onClick={onClose}>
          CLOSE
        </button>
        <div className={styles.kicker}>PROMPT {String(promptNo).padStart(2, "0")} · SOULSCAPE</div>
        <button
          type="button"
          className={styles.flip}
          onClick={toggleFacing}
          disabled={!ready}
          aria-label="Flip camera"
        >
          <FlipIcon />
        </button>
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
          <video ref={videoRef} className={styles.video} muted playsInline />
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
        <button
          type="button"
          className={styles.shoot}
          onClick={ready ? shoot : () => fileInputRef.current?.click()}
          disabled={capturing}
        >
          {capturing ? "…" : ready ? "SHOOT" : "CHOOSE PHOTO"}
        </button>
      </div>
    </div>
  );
}
