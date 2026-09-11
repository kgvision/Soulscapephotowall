import { getState, promptTextFor } from "./store";

export async function snapshot() {
  const s = await getState();
  return {
    code: s.code,
    moderation: s.moderation,
    showPrompts: s.showPrompts,
    promptNo: s.promptNo,
    promptText: promptTextFor(s.promptNo),
    hold: s.hold,
    heroIndex: s.heroIndex,
    serverNow: Date.now(),
    photos: s.photos,
  };
}

export type Snapshot = Awaited<ReturnType<typeof snapshot>>;
