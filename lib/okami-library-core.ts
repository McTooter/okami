/** Pure display rules shared by the Library’s editorial collection surfaces. */
export function selectLibraryRotation<T>(pinnedTracks: readonly T[], libraryTracks: readonly T[], limit = 3): T[] {
  return (pinnedTracks.length ? pinnedTracks : libraryTracks).slice(0, Math.max(0, limit));
}

export function formatLibraryCount(value: number): string {
  return String(Math.max(0, Math.trunc(value))).padStart(2, "0");
}
