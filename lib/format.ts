export function formatAgo(fromMs: number, nowMs: number = Date.now()): string {
  const diff = Math.max(0, nowMs - fromMs);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min";
  if (mins < 60) return mins + " min";
  const hrs = Math.floor(mins / 60);
  return hrs + (hrs === 1 ? " hr" : " hrs");
}

export function formatOnScreen(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec} s on screen`;
  return `${min} min ${sec} s on screen`;
}

export function initialsFor(name: string) {
  const trimmed = name.trim();
  return trimmed.slice(0, 2).toUpperCase() || "??";
}
