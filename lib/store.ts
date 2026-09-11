import { kv } from "./kv";
import { PROMPTS, promptTextFor } from "./prompts";

export { PROMPTS, promptTextFor };

export type PhotoStatus = "live" | "pending" | "removed";

export interface Photo {
  id: string;
  author: string;
  handle?: string;
  initials: string;
  imageUrl: string;
  ownerId: string;
  status: PhotoStatus;
  createdAt: number;
  promptNo: number;
}

export interface PublicState {
  code: string;
  moderation: "auto" | "staff";
  showPrompts: boolean;
  promptNo: number;
  hold: boolean;
  heroIndex: number;
  photos: Photo[];
}

export const SHOW_CODE = "SOUL26";

// No persistent process here (Vercel serverless functions don't run a
// background timer between requests), so the hero index is derived from
// wall-clock time instead of advanced by a setInterval — see
// computeHeroIndex. This is what makes rotation work correctly even though
// every request can land on a different, freshly-cold instance.
const ROTATION_INTERVAL_MS = 4200;
const MAX_PHOTOS = 300;

const META_KEY = "soulscape:meta";
const PHOTO_IDS_KEY = "soulscape:photo_ids";
const photoKey = (id: string) => `soulscape:photo:${id}`;

interface Meta {
  moderation: "auto" | "staff";
  showPrompts: boolean;
  promptNo: number;
  hold: boolean;
  rotationAnchorMs: number;
  holdIndex: number;
}

function defaultMeta(): Meta {
  return {
    moderation: "auto",
    showPrompts: true,
    promptNo: 3,
    hold: false,
    rotationAnchorMs: Date.now(),
    holdIndex: 0,
  };
}

function serializeMeta(m: Partial<Meta>): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  if (m.moderation !== undefined) out.moderation = m.moderation;
  if (m.showPrompts !== undefined) out.showPrompts = m.showPrompts ? "1" : "";
  if (m.promptNo !== undefined) out.promptNo = m.promptNo;
  if (m.hold !== undefined) out.hold = m.hold ? "1" : "";
  if (m.rotationAnchorMs !== undefined) out.rotationAnchorMs = m.rotationAnchorMs;
  if (m.holdIndex !== undefined) out.holdIndex = m.holdIndex;
  return out;
}

function parseMeta(raw: Record<string, string>): Meta {
  return {
    moderation: raw.moderation === "staff" ? "staff" : "auto",
    showPrompts: raw.showPrompts === "1",
    promptNo: Number(raw.promptNo) || 3,
    hold: raw.hold === "1",
    rotationAnchorMs: Number(raw.rotationAnchorMs) || Date.now(),
    holdIndex: Number(raw.holdIndex) || 0,
  };
}

async function getOrInitMeta(): Promise<Meta> {
  const raw = await kv.hgetall(META_KEY);
  if (raw) return parseMeta(raw);
  const fresh = defaultMeta();
  await kv.hset(META_KEY, serializeMeta(fresh));
  return fresh;
}

function serializePhoto(p: Photo): Record<string, string | number> {
  return {
    id: p.id,
    author: p.author,
    handle: p.handle ?? "",
    initials: p.initials,
    imageUrl: p.imageUrl,
    ownerId: p.ownerId,
    status: p.status,
    createdAt: p.createdAt,
    promptNo: p.promptNo,
  };
}

function parsePhoto(raw: Record<string, string>): Photo {
  return {
    id: raw.id,
    author: raw.author,
    handle: raw.handle || undefined,
    initials: raw.initials,
    imageUrl: raw.imageUrl,
    ownerId: raw.ownerId,
    status: raw.status === "pending" || raw.status === "removed" ? raw.status : "live",
    createdAt: Number(raw.createdAt) || Date.now(),
    promptNo: Number(raw.promptNo) || 1,
  };
}

function initialsFor(name: string) {
  const trimmed = name.trim();
  return trimmed.slice(0, 2).toUpperCase() || "??";
}

function computeHeroIndex(meta: Meta, liveCount: number): number {
  if (liveCount === 0) return 0;
  if (meta.hold) return ((meta.holdIndex % liveCount) + liveCount) % liveCount;
  const elapsed = Math.max(0, Date.now() - meta.rotationAnchorMs);
  const step = Math.floor(elapsed / ROTATION_INTERVAL_MS);
  return ((step % liveCount) + liveCount) % liveCount;
}

async function loadPhotos(): Promise<Photo[]> {
  const ids = await kv.lrange(PHOTO_IDS_KEY, 0, MAX_PHOTOS - 1);
  const raws = await Promise.all(ids.map((id) => kv.hgetall(photoKey(id))));
  const photos: Photo[] = [];
  for (const raw of raws) {
    if (raw) photos.push(parsePhoto(raw));
  }
  return photos;
}

export function validateCode(code: string) {
  return code.trim().toUpperCase() === SHOW_CODE;
}

export async function getState(): Promise<PublicState> {
  const [meta, photos] = await Promise.all([getOrInitMeta(), loadPhotos()]);
  const liveCount = photos.filter((p) => p.status === "live").length;
  return {
    code: SHOW_CODE,
    moderation: meta.moderation,
    showPrompts: meta.showPrompts,
    promptNo: meta.promptNo,
    hold: meta.hold,
    heroIndex: computeHeroIndex(meta, liveCount),
    photos,
  };
}

export async function addPhoto(input: {
  author: string;
  handle?: string;
  imageUrl: string;
  ownerId: string;
}): Promise<Photo> {
  const meta = await getOrInitMeta();
  const auto = meta.moderation === "auto";
  const photo: Photo = {
    id: "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    author: input.author,
    handle: input.handle || undefined,
    initials: initialsFor(input.author),
    imageUrl: input.imageUrl,
    ownerId: input.ownerId,
    status: auto ? "live" : "pending",
    createdAt: Date.now(),
    promptNo: meta.promptNo,
  };
  await kv.hset(photoKey(photo.id), serializePhoto(photo));
  await kv.lpush(PHOTO_IDS_KEY, photo.id);
  return photo;
}

export async function approvePhoto(id: string) {
  const raw = await kv.hgetall(photoKey(id));
  if (raw && raw.status === "pending") {
    await kv.hset(photoKey(id), { status: "live" });
  }
}

export async function removePhoto(id: string) {
  const raw = await kv.hgetall(photoKey(id));
  if (raw && raw.status !== "removed") {
    await kv.hset(photoKey(id), { status: "removed" });
  }
}

export async function toggleHold() {
  const meta = await getOrInitMeta();
  if (meta.hold) {
    // Releasing — resume the rotation fresh from index 0 rather than trying
    // to reconstruct exactly where it left off.
    await kv.hset(META_KEY, serializeMeta({ hold: false, rotationAnchorMs: Date.now() }));
  } else {
    const photos = await loadPhotos();
    const liveCount = photos.filter((p) => p.status === "live").length;
    const idx = computeHeroIndex(meta, liveCount);
    await kv.hset(META_KEY, serializeMeta({ hold: true, holdIndex: idx }));
  }
}

export async function pushNextPrompt() {
  const meta = await getOrInitMeta();
  const next = (meta.promptNo % PROMPTS.length) + 1;
  await kv.hset(META_KEY, serializeMeta({ promptNo: next }));
}
