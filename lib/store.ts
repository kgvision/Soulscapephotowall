import { EventEmitter } from "node:events";

export type PhotoStatus = "live" | "pending" | "removed";

export interface Photo {
  id: string;
  author: string;
  initials: string;
  imageUrl: string;
  ownerId: string;
  status: PhotoStatus;
  createdAt: number;
  promptNo: number;
  timesShown: number;
  msOnScreen: number;
}

export interface ShowState {
  code: string;
  moderation: "auto" | "staff";
  showPrompts: boolean;
  promptNo: number;
  hold: boolean;
  heroIndex: number;
  heroSince: number;
  photos: Photo[];
}

export const PROMPTS = [
  "The corner everyone photographs.",
  "Something you'd hang in your own hallway.",
  "The piece you'd steal if the lights went out.",
  "A detail nobody else will notice.",
  "The work that made you stop talking.",
  "Whatever's got the longest line right now.",
];

export const SHOW_CODE = "SOUL26";
const HERO_INTERVAL_MS = 4200;

interface Globals {
  __soulscapeStore?: ShowState;
  __soulscapeEmitter?: EventEmitter;
  __soulscapeTimer?: ReturnType<typeof setInterval>;
}
const g = globalThis as unknown as Globals;

function createInitialState(): ShowState {
  return {
    code: SHOW_CODE,
    moderation: "auto",
    showPrompts: true,
    promptNo: 3,
    hold: false,
    heroIndex: 0,
    heroSince: Date.now(),
    photos: [],
  };
}

if (!g.__soulscapeStore) g.__soulscapeStore = createInitialState();
if (!g.__soulscapeEmitter) g.__soulscapeEmitter = new EventEmitter().setMaxListeners(0);

const state = g.__soulscapeStore;
const emitter = g.__soulscapeEmitter;

export function livePhotos(): Photo[] {
  return state.photos.filter((p) => p.status === "live");
}

function clampHero() {
  const live = livePhotos();
  if (live.length === 0) {
    state.heroIndex = 0;
    return;
  }
  state.heroIndex = ((state.heroIndex % live.length) + live.length) % live.length;
}

function setHero(newIndex: number) {
  const live = livePhotos();
  if (live.length === 0) {
    state.heroIndex = 0;
    return;
  }
  const now = Date.now();
  const prevHero = live[state.heroIndex];
  if (prevHero) prevHero.msOnScreen += now - state.heroSince;
  state.heroIndex = ((newIndex % live.length) + live.length) % live.length;
  state.heroSince = now;
  const newHero = live[state.heroIndex];
  if (newHero) newHero.timesShown += 1;
}

function broadcast() {
  emitter.emit("update");
}

if (!g.__soulscapeTimer) {
  g.__soulscapeTimer = setInterval(() => {
    if (state.hold) return;
    const live = livePhotos();
    if (live.length <= 1) return;
    setHero(state.heroIndex + 1);
    broadcast();
  }, HERO_INTERVAL_MS);
}

export function getState(): ShowState {
  return state;
}

export function subscribe(fn: () => void) {
  emitter.on("update", fn);
  return () => emitter.off("update", fn);
}

export function validateCode(code: string) {
  return code.trim().toUpperCase() === SHOW_CODE;
}

function initialsFor(name: string) {
  const trimmed = name.trim();
  return trimmed.slice(0, 2).toUpperCase() || "??";
}

export function addPhoto(input: { author: string; imageUrl: string; ownerId: string }): Photo {
  const auto = state.moderation === "auto";
  const photo: Photo = {
    id: "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    author: input.author,
    initials: initialsFor(input.author),
    imageUrl: input.imageUrl,
    ownerId: input.ownerId,
    status: auto ? "live" : "pending",
    createdAt: Date.now(),
    promptNo: state.promptNo,
    timesShown: 0,
    msOnScreen: 0,
  };
  state.photos.unshift(photo);
  clampHero();
  broadcast();
  return photo;
}

export function approvePhoto(id: string) {
  const p = state.photos.find((p) => p.id === id);
  if (p && p.status === "pending") {
    p.status = "live";
    clampHero();
    broadcast();
  }
}

export function removePhoto(id: string) {
  const p = state.photos.find((p) => p.id === id);
  if (p && p.status !== "removed") {
    const live = livePhotos();
    const idx = live.findIndex((x) => x.id === id);
    p.status = "removed";
    if (idx !== -1 && idx <= state.heroIndex) {
      const newLive = livePhotos();
      if (newLive.length > 0) state.heroIndex = state.heroIndex % newLive.length;
      state.heroSince = Date.now();
    }
    clampHero();
    broadcast();
  }
}

export function toggleHold() {
  state.hold = !state.hold;
  broadcast();
}

export function pushNextPrompt() {
  state.promptNo = (state.promptNo % PROMPTS.length) + 1;
  broadcast();
}

export function promptTextFor(promptNo: number) {
  return PROMPTS[(promptNo - 1 + PROMPTS.length) % PROMPTS.length];
}
