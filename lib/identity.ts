"use client";

const KEY = "soulscape_identity";

export interface Identity {
  ownerId: string;
  name: string;
  handle?: string;
}

function randomId() {
  return "id_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function loadIdentity(): Identity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.ownerId === "string" && typeof parsed?.name === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

export function saveIdentity(name: string, handle?: string): Identity {
  const existing = loadIdentity();
  const identity: Identity = { ownerId: existing?.ownerId ?? randomId(), name, handle: handle || undefined };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(identity));
  } catch {
    // storage unavailable — identity still works for this session
  }
  return identity;
}

export function clearIdentity() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
