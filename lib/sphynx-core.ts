export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function nextTrackIndex(currentIndex: number, queueLength: number, direction: "next" | "previous") {
  if (queueLength <= 0) return 0;
  if (currentIndex < 0) return direction === "next" ? 0 : queueLength - 1;
  return direction === "next"
    ? (currentIndex + 1) % queueLength
    : (currentIndex - 1 + queueLength) % queueLength;
}

export function advanceProgress(currentProgress: number, increment: number) {
  const next = currentProgress + increment;
  return next >= 0.995 ? 0 : clamp(next, 0, 1);
}

export function adjustPreamp(value: number, delta: number) {
  return Number(clamp(value + delta, -6, 6).toFixed(1));
}
