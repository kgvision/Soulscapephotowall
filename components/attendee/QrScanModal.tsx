"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import styles from "./QrScanModal.module.css";

export function QrScanModal({
  onResult,
  onClose,
}: {
  onResult: (text: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;

    function scan() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        raf = requestAnimationFrame(scan);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        raf = requestAnimationFrame(scan);
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code?.data) {
        onResult(code.data);
        return;
      }
      raf = requestAnimationFrame(scan);
    }

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        scan();
      } catch {
        setError("Camera unavailable — type the code below instead.");
      }
    }

    start();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.header}>
        <span className={styles.title}>SCAN THE MONITOR&apos;S QR</span>
        <button type="button" className={styles.close} onClick={onClose}>
          CLOSE
        </button>
      </div>
      <div className={styles.frame}>
        <video ref={videoRef} className={styles.video} muted playsInline />
        <div className={styles.reticle} />
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
