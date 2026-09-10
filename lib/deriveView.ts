import type { Snapshot } from "./snapshot";

type Photo = Snapshot["photos"][number];

export function liveOnly(photos: Photo[]): Photo[] {
  return photos.filter((p) => p.status === "live");
}

export function heroPhoto(snap: Snapshot): Photo | null {
  const live = liveOnly(snap.photos);
  if (live.length === 0) return null;
  return live[snap.heroIndex % live.length] ?? live[0];
}

export function queuePhotos(snap: Snapshot, count: number): Photo[] {
  const live = liveOnly(snap.photos);
  const hero = heroPhoto(snap);
  return live.filter((p) => p.id !== hero?.id).slice(0, count);
}

export function gridPhotos(snap: Snapshot, count: number): Photo[] {
  return liveOnly(snap.photos).slice(0, count);
}
