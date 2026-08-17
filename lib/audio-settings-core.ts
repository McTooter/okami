export type AudioSettingsSnapshot = {
  preamp: number;
  limiter: boolean;
  crossfade: number;
  mono: boolean;
  eq: [number, number, number, number, number];
  motionReduced: boolean;
  typeScale: "standard" | "large" | "extra";
};

export type EqPreset = {
  id: string;
  name: string;
  groupId: string;
  settings: AudioSettingsSnapshot;
  createdAt: number;
  updatedAt: number;
};

export type HeadphoneGroup = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  protected?: boolean;
};

export const DEFAULT_HEADPHONE_GROUP: HeadphoneGroup = {
  id: "general-audio",
  name: "General audio",
  createdAt: 0,
  updatedAt: 0,
  protected: true,
};

export type AudioSettingsExport = {
  schemaVersion: 1;
  app: "Sphynx";
  exportedAt: string;
  sound: AudioSettingsSnapshot;
  eqPresets: EqPreset[];
  headphoneGroups: HeadphoneGroup[];
  activeHeadphoneGroupId: string;
};

export function cloneAudioSettings(settings: AudioSettingsSnapshot): AudioSettingsSnapshot {
  return { ...settings, eq: [...settings.eq] as AudioSettingsSnapshot["eq"] };
}

export function normalizePresetName(input: string) {
  const normalized = input.trim().replace(/\s+/g, " ").slice(0, 32);
  return normalized || "Untitled preset";
}

export function normalizeHeadphoneGroupName(input: string) {
  const normalized = input.trim().replace(/\s+/g, " ").slice(0, 32);
  return normalized || "Untitled device";
}

export function createHeadphoneGroup(id: string, name: string, now: number): HeadphoneGroup {
  return { id, name: normalizeHeadphoneGroupName(name), createdAt: now, updatedAt: now };
}

export function createEqPreset(id: string, name: string, settings: AudioSettingsSnapshot, now: number, groupId = DEFAULT_HEADPHONE_GROUP.id): EqPreset {
  return {
    id,
    name: normalizePresetName(name),
    groupId,
    settings: cloneAudioSettings(settings),
    createdAt: now,
    updatedAt: now,
  };
}

export function buildAudioSettingsExport(
  sound: AudioSettingsSnapshot,
  eqPresets: EqPreset[],
  exportedAt: Date,
  headphoneGroups: HeadphoneGroup[] = [DEFAULT_HEADPHONE_GROUP],
  activeHeadphoneGroupId = DEFAULT_HEADPHONE_GROUP.id,
): AudioSettingsExport {
  return {
    schemaVersion: 1,
    app: "Sphynx",
    exportedAt: exportedAt.toISOString(),
    sound: cloneAudioSettings(sound),
    eqPresets: eqPresets.map((preset) => ({ ...preset, settings: cloneAudioSettings(preset.settings) })),
    headphoneGroups: headphoneGroups.map((group) => ({ ...group })),
    activeHeadphoneGroupId,
  };
}
