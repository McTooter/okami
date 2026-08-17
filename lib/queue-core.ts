export type QueueItem = { id: string };

/** Preserves a user order where possible, then appends tracks not yet known to it. */
export function applyQueueOrder<T extends QueueItem>(tracks: readonly T[], order: readonly string[]): T[] {
  const byId = new Map(tracks.map((track) => [track.id, track]));
  const ordered = order.flatMap((id) => {
    const track = byId.get(id);
    return track ? [track] : [];
  });
  const known = new Set(ordered.map((track) => track.id));
  return [...ordered, ...tracks.filter((track) => !known.has(track.id))];
}

/** Moves a queue id one accessible step without altering any other order. */
export function moveQueueId(order: readonly string[], id: string, direction: "up" | "down"): string[] {
  const from = order.indexOf(id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= order.length) return [...order];
  const next = [...order];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}
