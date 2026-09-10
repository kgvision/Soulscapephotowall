import { getState, promptTextFor } from "./store";

export function snapshot() {
  const s = getState();
  return {
    code: s.code,
    moderation: s.moderation,
    showPrompts: s.showPrompts,
    promptNo: s.promptNo,
    promptText: promptTextFor(s.promptNo),
    hold: s.hold,
    heroIndex: s.heroIndex,
    heroSince: s.heroSince,
    serverNow: Date.now(),
    photos: s.photos,
  };
}

export type Snapshot = ReturnType<typeof snapshot>;
