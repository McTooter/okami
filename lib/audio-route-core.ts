import type { HeadphoneGroup } from "./audio-settings-core";

export type DetectedAudioRoute = {
  kind: "bluetooth" | "wired" | "airplay" | "speaker" | "receiver" | "unknown";
  name: string | null;
};

export const UNKNOWN_AUDIO_ROUTE: DetectedAudioRoute = { kind: "unknown", name: null };

function normalizeDeviceName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function findMatchingHeadphoneGroup(route: DetectedAudioRoute, groups: HeadphoneGroup[]): HeadphoneGroup | null {
  if (route.kind !== "bluetooth" || !route.name) return null;

  const outputName = normalizeDeviceName(route.name);
  if (outputName.length < 4) return null;

  const matches = groups.filter((group) => {
    if (group.protected) return false;
    const groupName = normalizeDeviceName(group.name);
    if (groupName.length < 4) return false;
    return outputName === groupName || outputName.includes(groupName) || groupName.includes(outputName);
  });

  return matches.length === 1 ? matches[0] : null;
}
