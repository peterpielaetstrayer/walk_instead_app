/** Format seconds as M:SS or H:MM:SS for timer display */
export function formatTimerDisplay(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Human-readable duration for history (e.g. "14 min", "1 hr 24 min") */
export function formatDurationHuman(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s < 60) {
    return `${s} sec`;
  }
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  if (hours === 0) {
    return `${minutes} min`;
  }
  if (minutes === 0) {
    return hours === 1 ? "1 hr" : `${hours} hr`;
  }
  return `${hours} hr ${minutes} min`;
}

export function formatWalkDateTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfToday) return `Today, ${time}`;
  if (date >= startOfYesterday) return `Yesterday, ${time}`;

  const datePart = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `${datePart}, ${time}`;
}

export function formatStaleWalkLabel(iso: string): string {
  return formatWalkDateTime(iso);
}
