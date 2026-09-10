"use client";

import { useEffect, useMemo, useState } from "react";
import { JoinScreen } from "@/components/attendee/JoinScreen";
import { FeedScreen } from "@/components/attendee/FeedScreen";
import { CaptureScreen } from "@/components/attendee/CaptureScreen";
import { ReviewScreen } from "@/components/attendee/ReviewScreen";
import { PostedScreen } from "@/components/attendee/PostedScreen";
import { MineScreen } from "@/components/attendee/MineScreen";
import { BottomNav } from "@/components/attendee/BottomNav";
import { useLiveState } from "@/hooks/useLiveState";
import { loadIdentity } from "@/lib/identity";
import { uploadPhoto } from "@/lib/api";
import styles from "./page.module.css";

type Screen = "join" | "feed" | "capture" | "review" | "posted" | "mine";

export default function Home() {
  const { state, now } = useLiveState();
  const [screen, setScreen] = useState<Screen>("join");
  const [name, setName] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [initialCode, setInitialCode] = useState("");
  const [pending, setPending] = useState<{ blob: Blob; url: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [postedAuto, setPostedAuto] = useState(true);
  const [ready, setReady] = useState(false);
  // Once true, CaptureScreen stays mounted (just hidden) for the rest of the
  // session instead of unmounting on every screen change — that was tearing
  // the camera stream down and forcing a full reconnect on every reshoot,
  // which is the real source of the "shoot button is slow" lag.
  const [cameraEngaged, setCameraEngaged] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect --
       One-time hydration from localStorage/URL on mount — window is unavailable
       during the server render, so this can't be a lazy useState initializer. */
    const identity = loadIdentity();
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get("code")?.toUpperCase() ?? "";
    if (identity) {
      setName(identity.name);
      setOwnerId(identity.ownerId);
      setScreen("feed");
    } else if (codeFromUrl) {
      setInitialCode(codeFromUrl);
    }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    return () => {
      if (pending) URL.revokeObjectURL(pending.url);
    };
  }, [pending]);

  function handleJoined(joinedName: string) {
    const identity = loadIdentity();
    setName(joinedName);
    if (identity) setOwnerId(identity.ownerId);
    setScreen("feed");
  }

  function openCapture() {
    setCameraEngaged(true);
    setScreen("capture");
  }

  function handleCaptured(blob: Blob) {
    setPending((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return { blob, url: URL.createObjectURL(blob) };
    });
    setScreen("review");
  }

  async function handlePost() {
    if (!pending || submitting) return;
    setSubmitting(true);
    const res = await uploadPhoto({ code: state?.code ?? "", author: name, ownerId, blob: pending.blob });
    setSubmitting(false);
    if (!res.ok) {
      window.alert(res.error ?? "Couldn't send that photo — try again.");
      return;
    }
    setPostedAuto(state?.moderation !== "staff");
    setScreen("posted");
  }

  const moderationNote = useMemo(() => {
    const auto = state?.moderation !== "staff";
    return auto
      ? "Goes straight up. A steward can pull it down at any point."
      : "A steward checks it first — usually under a minute at the desk.";
  }, [state?.moderation]);

  if (!ready || !state) {
    return <div className={styles.loading}>Loading the wall…</div>;
  }

  return (
    <div className={styles.shell}>
      {screen === "join" && <JoinScreen initialCode={initialCode} initialName={name} onJoined={handleJoined} />}

      {screen === "feed" && (
        <>
          <FeedScreen snapshot={state} now={now} onGoHome={() => setScreen("join")} />
          <BottomNav active="feed" onNavigate={(s) => (s === "capture" ? openCapture() : setScreen(s))} />
        </>
      )}

      {screen === "review" && pending && (
        <ReviewScreen
          previewUrl={pending.url}
          myName={name}
          promptNo={state.promptNo}
          moderationNote={moderationNote}
          submitting={submitting}
          onReshoot={openCapture}
          onPost={handlePost}
        />
      )}

      {screen === "posted" && pending && (
        <PostedScreen
          auto={postedAuto}
          previewUrl={pending.url}
          onWatch={() => setScreen("feed")}
          onShootAnother={openCapture}
        />
      )}

      {screen === "mine" && (
        <>
          <MineScreen snapshot={state} now={now} myName={name} myOwnerId={ownerId} />
          <BottomNav active="mine" onNavigate={(s) => (s === "capture" ? openCapture() : setScreen(s))} />
        </>
      )}

      {cameraEngaged && (
        <CaptureScreen
          hidden={screen !== "capture"}
          promptNo={state.promptNo}
          promptText={state.promptText}
          onClose={() => setScreen("feed")}
          onCaptured={handleCaptured}
        />
      )}
    </div>
  );
}
