import type { ArtworkId } from "./sphynx-store";

export type ListeningProfileId = "sora" | "night-transit" | "guest-session";

export type ListeningProfile = {
  id: ListeningProfileId;
  name: string;
  descriptor: string;
  taste: string;
  note: string;
  cue: string;
  artwork: ArtworkId;
};

export const LISTENING_PROFILES: readonly ListeningProfile[] = [
  { id: "sora", name: "Sora", descriptor: "Primary desk", taste: "Slow-glow electronica", note: "Keeps the current playback queue close.", cue: "#CAFF4A", artwork: "interval" },
  { id: "night-transit", name: "Night Transit", descriptor: "Late listening", taste: "Nocturne, pressure, long-form", note: "A separate queue for after-hours listening.", cue: "#8DA8FF", artwork: "horizon" },
  { id: "guest-session", name: "Guest Session", descriptor: "Shared room", taste: "Open rotation", note: "A light-touch space that keeps source details visible.", cue: "#F4D35E", artwork: "verge" },
] as const;

export function findListeningProfile(id: string | null | undefined): ListeningProfile {
  return LISTENING_PROFILES.find((profile) => profile.id === id) ?? LISTENING_PROFILES[0];
}

export function normalizeProfileQueueOrders(value: unknown): Partial<Record<ListeningProfileId, string[]>> {
  if (!value || typeof value !== "object") return {};
  const input = value as Record<string, unknown>;
  return LISTENING_PROFILES.reduce<Partial<Record<ListeningProfileId, string[]>>>((result, profile) => {
    const order = input[profile.id];
    if (Array.isArray(order)) result[profile.id] = order.filter((id): id is string => typeof id === "string");
    return result;
  }, {});
}
