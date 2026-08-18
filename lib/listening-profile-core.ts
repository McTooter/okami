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

export type ListeningProfileCustomization = {
  name?: string;
  cue?: string;
};

export const PROFILE_AVATAR_COLORS = ["#CAFF4A", "#F05A47", "#E7A628", "#8DA8FF", "#EE8CF5", "#71D6D1"] as const;
export const MAX_PROFILE_PINNED_ALBUMS = 8;

export const LISTENING_PROFILES: readonly ListeningProfile[] = [
  { id: "sora", name: "Sora", descriptor: "Primary desk", taste: "Slow-glow electronica", note: "Keeps the current playback queue close.", cue: "#CAFF4A", artwork: "interval" },
  { id: "night-transit", name: "Night Transit", descriptor: "Late listening", taste: "Nocturne, pressure, long-form", note: "A separate queue for after-hours listening.", cue: "#8DA8FF", artwork: "horizon" },
  { id: "guest-session", name: "Guest Session", descriptor: "Shared room", taste: "Open rotation", note: "A light-touch space that keeps source details visible.", cue: "#F4D35E", artwork: "verge" },
] as const;

export function findListeningProfile(id: string | null | undefined): ListeningProfile {
  return LISTENING_PROFILES.find((profile) => profile.id === id) ?? LISTENING_PROFILES[0];
}

export function normalizeProfileCustomization(value: unknown): ListeningProfileCustomization {
  if (!value || typeof value !== "object") return {};
  const input = value as Record<string, unknown>;
  const rawName = typeof input.name === "string" ? input.name.replace(/\s+/g, " ").trim().slice(0, 26) : "";
  const rawCue = typeof input.cue === "string" && PROFILE_AVATAR_COLORS.includes(input.cue as (typeof PROFILE_AVATAR_COLORS)[number]) ? input.cue : undefined;
  return { ...(rawName ? { name: rawName } : {}), ...(rawCue ? { cue: rawCue } : {}) };
}

export function normalizeProfileCustomizations(value: unknown): Partial<Record<ListeningProfileId, ListeningProfileCustomization>> {
  if (!value || typeof value !== "object") return {};
  const input = value as Record<string, unknown>;
  return LISTENING_PROFILES.reduce<Partial<Record<ListeningProfileId, ListeningProfileCustomization>>>((result, profile) => {
    const normalized = normalizeProfileCustomization(input[profile.id]);
    if (Object.keys(normalized).length) result[profile.id] = normalized;
    return result;
  }, {});
}

export function mergeListeningProfiles(customizations: Partial<Record<ListeningProfileId, ListeningProfileCustomization>>): ListeningProfile[] {
  return LISTENING_PROFILES.map((profile) => ({ ...profile, ...customizations[profile.id] }));
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

export function normalizePinnedTrackIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids = value.filter((id): id is string => typeof id === "string" && id.length > 0);
  return [...new Set(ids)].slice(0, MAX_PROFILE_PINNED_ALBUMS);
}

export function normalizeProfilePinnedTrackIds(value: unknown): Partial<Record<ListeningProfileId, string[]>> {
  if (!value || typeof value !== "object") return {};
  const input = value as Record<string, unknown>;
  return LISTENING_PROFILES.reduce<Partial<Record<ListeningProfileId, string[]>>>((result, profile) => {
    const ids = normalizePinnedTrackIds(input[profile.id]);
    if (ids.length) result[profile.id] = ids;
    return result;
  }, {});
}

/** Retains the current pin membership while accepting an arbitrary drag result. */
export function reorderPinnedTrackIds(current: readonly string[], proposed: readonly string[]): string[] {
  const normalizedCurrent = normalizePinnedTrackIds(current);
  const allowed = new Set(normalizedCurrent);
  const proposedUnique = normalizePinnedTrackIds(proposed).filter((id) => allowed.has(id));
  const missing = normalizedCurrent.filter((id) => !proposedUnique.includes(id));
  return [...proposedUnique, ...missing];
}

export function movePinnedTrackId(ids: readonly string[], trackId: string, direction: "left" | "right"): string[] {
  const current = normalizePinnedTrackIds(ids);
  const index = current.indexOf(trackId);
  const nextIndex = direction === "left" ? index - 1 : index + 1;
  if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
  const next = [...current];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}
