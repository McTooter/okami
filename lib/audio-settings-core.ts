import { clampAdvancedAudioSettings, DEFAULT_ADVANCED_AUDIO_SETTINGS, type AdvancedAudioSettings } from "./advanced-audio-core";

export type AudioSettingsSnapshot = AdvancedAudioSettings & {
  preamp: number;
  limiter: boolean;
  crossfade: number;
  mono: boolean;
  eq: [number, number, number, number, number];
  motionReduced: boolean;
  typeScale: "standard" | "large" | "extra";
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettingsSnapshot = {
  preamp: 0,
  limiter: true,
  crossfade: 4,
  mono: false,
  eq: [0, 0, 0, 0, 0],
  motionReduced: false,
  typeScale: "standard",
  ...DEFAULT_ADVANCED_AUDIO_SETTINGS,
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
  schemaVersion: 2;
  app: "Okami";
  exportedAt: string;
  sound: AudioSettingsSnapshot;
  eqPresets: EqPreset[];
  headphoneGroups: HeadphoneGroup[];
  activeHeadphoneGroupId: string;
};

export function normalizeAudioSettings(settings: Partial<AudioSettingsSnapshot>): AudioSettingsSnapshot {
  const advanced = clampAdvancedAudioSettings(settings);
  const candidateEq = Array.isArray(settings.eq) ? settings.eq : DEFAULT_AUDIO_SETTINGS.eq;
  const eq = [0, 1, 2, 3, 4].map((index) => {
    const value = candidateEq[index];
    return Number.isFinite(value) ? Math.min(12, Math.max(-12, Number(value))) : 0;
  }) as AudioSettingsSnapshot["eq"];
  return {
    ...DEFAULT_AUDIO_SETTINGS,
    ...advanced,
    preamp: Number.isFinite(settings.preamp) ? Math.min(6, Math.max(-6, Number(settings.preamp))) : DEFAULT_AUDIO_SETTINGS.preamp,
    crossfade: Number.isFinite(settings.crossfade) ? Math.min(12, Math.max(0, Math.round(Number(settings.crossfade)))) : DEFAULT_AUDIO_SETTINGS.crossfade,
    limiter: typeof settings.limiter === "boolean" ? settings.limiter : DEFAULT_AUDIO_SETTINGS.limiter,
    mono: typeof settings.mono === "boolean" ? settings.mono : DEFAULT_AUDIO_SETTINGS.mono,
    motionReduced: typeof settings.motionReduced === "boolean" ? settings.motionReduced : DEFAULT_AUDIO_SETTINGS.motionReduced,
    typeScale: settings.typeScale === "large" || settings.typeScale === "extra" ? settings.typeScale : "standard",
    eq,
  };
}

export function cloneAudioSettings(settings: AudioSettingsSnapshot): AudioSettingsSnapshot {
  return normalizeAudioSettings(settings);
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
    schemaVersion: 2,
    app: "Okami",
    exportedAt: exportedAt.toISOString(),
    sound: cloneAudioSettings(sound),
    eqPresets: eqPresets.map((preset) => ({ ...preset, settings: cloneAudioSettings(preset.settings) })),
    headphoneGroups: headphoneGroups.map((group) => ({ ...group })),
    activeHeadphoneGroupId,
  };
}
