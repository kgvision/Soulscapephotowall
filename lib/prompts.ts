// Shared with the client (CaptureScreen cycles through these locally on
// every open) as well as the server-side store, so this has to stay free of
// any node-only imports.
export const PROMPTS = [
  "The corner everyone photographs.",
  "Something you'd hang in your own hallway.",
  "The piece you'd steal if the lights went out.",
  "A detail nobody else will notice.",
  "The work that made you stop talking.",
  "Whatever's got the longest line right now.",
];

export function promptTextFor(promptNo: number) {
  return PROMPTS[(promptNo - 1 + PROMPTS.length) % PROMPTS.length];
}
