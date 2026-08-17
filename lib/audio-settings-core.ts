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
  settings: AudioSettingsSnapshot;
  createdAt: number;
  updatedAt: number;
};

export type AudioSettingsExport = {
  schemaVersion: 1;
  app: "Sphynx";
  exportedAt: string;
  sound: AudioSettingsSnapshot;
  eqPresets: EqPreset[];
};

export function cloneAudioSettings(settings: AudioSettingsSnapshot): AudioSettingsSnapshot {
  return { ...settings, eq: [...settings.eq] as AudioSettingsSnapshot["eq"] };
}

export function normalizePresetName(input: string) {
  const normalized = input.trim().replace(/\s+/g, " ").slice(0, 32);
  return normalized || "Untitled preset";
}

export function createEqPreset(id: string, name: string, settings: AudioSettingsSnapshot, now: number): EqPreset {
  return {
    id,
    name: normalizePresetName(name),
    settings: cloneAudioSettings(settings),
    createdAt: now,
    updatedAt: now,
  };
}

export function buildAudioSettingsExport(sound: AudioSettingsSnapshot, eqPresets: EqPreset[], exportedAt: Date): AudioSettingsExport {
  return {
    schemaVersion: 1,
    app: "Sphynx",
    exportedAt: exportedAt.toISOString(),
    sound: cloneAudioSettings(sound),
    eqPresets: eqPresets.map((preset) => ({ ...preset, settings: cloneAudioSettings(preset.settings) })),
  };
}
