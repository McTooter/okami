/** Returns true only for the wide iPad-style canvas used by the Library split view. */
export function isWideLibraryCanvas(width: number, height: number): boolean {
  return Number.isFinite(width) && Number.isFinite(height) && width >= 900 && width > height;
}
